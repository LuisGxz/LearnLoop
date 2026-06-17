package dev.learnloop.api.service;

import dev.learnloop.api.domain.*;
import dev.learnloop.api.repository.*;
import dev.learnloop.api.web.ApiException;
import dev.learnloop.api.web.dto.LearningDtos.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizzes;
    private final QuizAttemptRepository attempts;
    private final EnrollmentRepository enrollments;
    private final UserRepository users;
    private final GamificationService gamification;

    @Transactional(readOnly = true)
    public QuizView view(Long quizId) {
        Quiz q = quizzes.findById(quizId)
            .orElseThrow(() -> ApiException.notFound("Quiz not found."));
        List<QuestionView> questions = q.getQuestions().stream()
            .map(qq -> new QuestionView(
                qq.getId(), qq.getText(),
                qq.getOptions().stream()
                    .map(o -> new OptionView(o.getId(), o.getText()))
                    .toList()))
            .toList();
        return new QuizView(q.getId(), q.getTitle(), q.getPassingScore(), questions);
    }

    @Transactional
    public QuizResult submit(Long quizId, QuizSubmission submission, Long studentId) {
        Quiz q = quizzes.findById(quizId)
            .orElseThrow(() -> ApiException.notFound("Quiz not found."));
        Long courseId = q.getModule().getCourse().getId();
        if (!enrollments.existsByStudentIdAndCourseId(studentId, courseId)) {
            throw ApiException.forbidden("Enroll in the course first.");
        }
        User student = users.findById(studentId).orElseThrow();

        Map<Long, Long> chosen = new HashMap<>();
        if (submission.answers() != null) {
            submission.answers().forEach(a -> chosen.put(a.questionId(), a.optionId()));
        }

        List<QuestionResult> results = new ArrayList<>();
        int correct = 0;
        for (Question qq : q.getQuestions()) {
            Long correctOptId = qq.getOptions().stream()
                .filter(QuestionOption::isCorrect).map(QuestionOption::getId)
                .findFirst().orElse(null);
            Long chosenOptId = chosen.get(qq.getId());
            boolean isCorrect = correctOptId != null && correctOptId.equals(chosenOptId);
            if (isCorrect) correct++;
            results.add(new QuestionResult(
                qq.getId(), correctOptId, chosenOptId, isCorrect, qq.getExplanation()));
        }

        int totalQ = q.getQuestions().size();
        int score = totalQ == 0 ? 0 : (int) Math.round(correct * 100.0 / totalQ);
        boolean passed = score >= q.getPassingScore();
        int xpEarned = passed ? q.getXpReward() : (int) Math.round(q.getXpReward() * score / 100.0);

        gamification.addXp(student, xpEarned);
        gamification.touchStreak(student);
        List<BadgeDto> newBadges = new ArrayList<>();
        if (score == 100) {
            BadgeDto ace = gamification.awardIfAbsent(student, "QUIZ_ACE");
            if (ace != null) newBadges.add(ace);
        }
        newBadges.addAll(gamification.checkStreakBadges(student));
        gamification.save(student);

        QuizAttempt attempt = new QuizAttempt();
        attempt.setStudent(student);
        attempt.setQuiz(q);
        attempt.setScore(score);
        attempt.setCorrectCount(correct);
        attempt.setTotalCount(totalQ);
        attempt.setPassed(passed);
        attempt.setXpEarned(xpEarned);
        attempts.save(attempt);

        return new QuizResult(
            score, correct, totalQ, passed, xpEarned, student.getXp(), results, newBadges);
    }
}
