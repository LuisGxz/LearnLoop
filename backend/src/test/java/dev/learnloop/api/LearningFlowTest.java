package dev.learnloop.api;

import static org.assertj.core.api.Assertions.assertThat;

import dev.learnloop.api.domain.LessonType;
import dev.learnloop.api.domain.Role;
import dev.learnloop.api.domain.User;
import dev.learnloop.api.repository.BadgeRepository;
import dev.learnloop.api.repository.UserRepository;
import dev.learnloop.api.domain.Badge;
import dev.learnloop.api.service.CourseService;
import dev.learnloop.api.service.EnrollmentService;
import dev.learnloop.api.service.QuizService;
import dev.learnloop.api.web.dto.CourseDtos.*;
import dev.learnloop.api.web.dto.LearningDtos.*;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/** End-to-end critical path against in-memory H2: author → enroll → learn → quiz. */
@SpringBootTest
class LearningFlowTest {

    @Autowired CourseService courseService;
    @Autowired EnrollmentService enrollmentService;
    @Autowired QuizService quizService;
    @Autowired UserRepository users;
    @Autowired BadgeRepository badges;

    private User newUser(String email, Role role) {
        User u = new User();
        u.setName(email);
        u.setEmail(email);
        u.setPasswordHash("x");
        u.setRole(role);
        return users.save(u);
    }

    private void seedBadge(String code) {
        if (badges.findByCode(code).isPresent()) return;
        Badge b = new Badge();
        b.setCode(code);
        b.setName(code);
        b.setDescription(code);
        badges.save(b);
    }

    @Test
    void authorEnrollLearnAndAceTheQuiz() {
        seedBadge("FIRST_LESSON");
        seedBadge("QUIZ_ACE");
        User instructor = newUser("ins@test.dev", Role.INSTRUCTOR);
        User student = newUser("stu@test.dev", Role.STUDENT);

        // Author a course with one lesson and a 1-question quiz.
        CourseInput input = new CourseInput(
            "Test Course", "A description long enough to pass validation.", "Code", "Beginner", "t-1",
            List.of(new ModuleInput("M1",
                List.of(new LessonInput("L1", LessonType.VIDEO, 5, "body")),
                new QuizInput("Q1", 60, List.of(
                    new QuestionInput("2 + 2 = ?", "Basic math",
                        List.of(new OptionInput("3", false), new OptionInput("4", true))))))));
        CourseDetail course = courseService.create(input, instructor.getId());
        Long lessonId = course.modules().get(0).lessons().get(0).id();
        Long quizId = course.modules().get(0).quiz().id();

        // Enroll + complete the lesson → XP + first-lesson badge + progress.
        enrollmentService.enroll(course.id(), student.getId());
        CompleteLessonResult done = enrollmentService.completeLesson(lessonId, student.getId());
        assertThat(done.xpEarned()).isGreaterThan(0);
        assertThat(done.progressPercent()).isEqualTo(100);
        assertThat(done.courseCompleted()).isTrue();
        assertThat(done.newBadges()).anyMatch(b -> b.code().equals("FIRST_LESSON"));

        // Quiz view must not leak correct answers.
        QuizView view = quizService.view(quizId);
        assertThat(view.questions()).hasSize(1);

        // Ace the quiz → 100, passed, QUIZ_ACE.
        Long correctOptionId = view.questions().get(0).options().stream()
            .filter(o -> o.text().equals("4")).findFirst().orElseThrow().id();
        QuizResult result = quizService.submit(
            quizId,
            new QuizSubmission(List.of(new Answer(view.questions().get(0).id(), correctOptionId))),
            student.getId());
        assertThat(result.score()).isEqualTo(100);
        assertThat(result.passed()).isTrue();
        assertThat(result.questions().get(0).correct()).isTrue();
        assertThat(result.newBadges()).anyMatch(b -> b.code().equals("QUIZ_ACE"));
    }
}
