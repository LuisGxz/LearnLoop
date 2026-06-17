package dev.learnloop.api.service;

import dev.learnloop.api.domain.*;
import dev.learnloop.api.repository.*;
import dev.learnloop.api.web.ApiException;
import dev.learnloop.api.web.dto.CourseDtos.*;
import java.util.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courses;
    private final UserRepository users;
    private final EnrollmentRepository enrollments;
    private final LessonProgressRepository progress;
    private final QuizAttemptRepository attempts;

    @Transactional(readOnly = true)
    public List<CourseSummary> catalog(Long viewerId) {
        return courses.findByPublishedTrueOrderByCreatedAtDesc().stream()
            .map(c -> toSummary(c, viewerId))
            .toList();
    }

    @Transactional(readOnly = true)
    public List<CourseSummary> byInstructor(Long instructorId) {
        return courses.findByInstructorIdOrderByCreatedAtDesc(instructorId).stream()
            .map(c -> toSummary(c, instructorId))
            .toList();
    }

    @Transactional(readOnly = true)
    public CourseDetail detail(Long courseId, Long viewerId) {
        Course c = courses.findById(courseId)
            .orElseThrow(() -> ApiException.notFound("Course not found."));

        Set<Long> completed = Set.of();
        boolean enrolled = false;
        if (viewerId != null) {
            var enr = enrollments.findByStudentIdAndCourseId(viewerId, courseId).orElse(null);
            if (enr != null) {
                enrolled = true;
                completed = new HashSet<>();
                for (LessonProgress lp : progress.findByEnrollmentId(enr.getId())) {
                    completed.add(lp.getLesson().getId());
                }
            }
        }
        final Set<Long> done = completed;

        List<ModuleDetail> modules = c.getModules().stream()
            .map(m -> new ModuleDetail(
                m.getId(), m.getTitle(), m.getPosition(),
                m.getLessons().stream()
                    .map(l -> new LessonDetail(
                        l.getId(), l.getTitle(), l.getType(), l.getDurationMin(),
                        l.getContent(), l.getPosition(), l.getXpReward(),
                        done.contains(l.getId())))
                    .toList(),
                quizMeta(m, viewerId)))
            .toList();

        int total = totalLessons(c);
        int pct = total == 0 ? 0 : (int) Math.round(done.size() * 100.0 / total);
        boolean courseDone = total > 0 && done.size() >= total;

        User i = c.getInstructor();
        return new CourseDetail(
            c.getId(), c.getTitle(), c.getDescription(), c.getCategory(), c.getLevel(),
            c.getCoverGradient(), new InstructorDto(i.getId(), i.getName(), i.getTitle()),
            modules, enrolled, pct, courseDone);
    }

    @Transactional
    public CourseDetail create(CourseInput in, Long instructorId) {
        User instructor = users.findById(instructorId).orElseThrow();
        Course c = new Course();
        c.setInstructor(instructor);
        apply(c, in);
        courses.save(c);
        return detail(c.getId(), instructorId);
    }

    @Transactional
    public CourseDetail update(Long courseId, CourseInput in, Long instructorId) {
        Course c = courses.findById(courseId)
            .orElseThrow(() -> ApiException.notFound("Course not found."));
        requireOwner(c, instructorId);
        c.getModules().clear(); // orphanRemoval wipes the old graph
        apply(c, in);
        courses.save(c);
        return detail(c.getId(), instructorId);
    }

    @Transactional
    public void delete(Long courseId, Long instructorId) {
        Course c = courses.findById(courseId)
            .orElseThrow(() -> ApiException.notFound("Course not found."));
        requireOwner(c, instructorId);
        courses.delete(c);
    }

    // ── helpers ───────────────────────────────────────────────────────

    private void requireOwner(Course c, Long instructorId) {
        if (!c.getInstructor().getId().equals(instructorId)) {
            throw ApiException.forbidden("You can only manage your own courses.");
        }
    }

    private void apply(Course c, CourseInput in) {
        c.setTitle(in.title().trim());
        c.setDescription(in.description().trim());
        c.setCategory(in.category().trim());
        c.setLevel(in.level().trim());
        c.setCoverGradient(in.coverGradient());
        int mPos = 1;
        for (ModuleInput mi : in.modules()) {
            CourseModule m = new CourseModule();
            m.setCourse(c);
            m.setTitle(mi.title().trim());
            m.setPosition(mPos++);
            int lPos = 1;
            if (mi.lessons() != null) {
                for (LessonInput li : mi.lessons()) {
                    Lesson l = new Lesson();
                    l.setModule(m);
                    l.setTitle(li.title().trim());
                    l.setType(li.type());
                    l.setDurationMin(li.durationMin());
                    l.setContent(li.content());
                    l.setPosition(lPos++);
                    m.getLessons().add(l);
                }
            }
            if (mi.quiz() != null && mi.quiz().questions() != null
                && !mi.quiz().questions().isEmpty()) {
                Quiz q = new Quiz();
                q.setModule(m);
                q.setTitle(mi.quiz().title().trim());
                q.setPassingScore(mi.quiz().passingScore());
                int qPos = 1;
                for (QuestionInput qi : mi.quiz().questions()) {
                    Question qq = new Question();
                    qq.setQuiz(q);
                    qq.setText(qi.text().trim());
                    qq.setExplanation(qi.explanation());
                    qq.setPosition(qPos++);
                    int oPos = 0;
                    for (OptionInput oi : qi.options()) {
                        QuestionOption o = new QuestionOption();
                        o.setQuestion(qq);
                        o.setText(oi.text().trim());
                        o.setCorrect(oi.correct());
                        o.setPosition(oPos++);
                        qq.getOptions().add(o);
                    }
                    q.getQuestions().add(qq);
                }
                m.setQuiz(q);
            }
            c.getModules().add(m);
        }
    }

    private CourseSummary toSummary(Course c, Long viewerId) {
        int total = totalLessons(c);
        int duration = c.getModules().stream()
            .flatMap(m -> m.getLessons().stream())
            .mapToInt(Lesson::getDurationMin).sum();
        boolean enrolled = false;
        Integer pct = null;
        if (viewerId != null) {
            var enr = enrollments.findByStudentIdAndCourseId(viewerId, c.getId()).orElse(null);
            if (enr != null) {
                enrolled = true;
                long done = progress.countByEnrollmentId(enr.getId());
                pct = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
            }
        }
        return new CourseSummary(
            c.getId(), c.getTitle(), c.getDescription(), c.getCategory(), c.getLevel(),
            c.getCoverGradient(), c.getInstructor().getName(),
            c.getModules().size(), total, duration, enrolled, pct);
    }

    private QuizMeta quizMeta(CourseModule m, Long viewerId) {
        Quiz q = m.getQuiz();
        if (q == null) return null;
        Integer best = null;
        if (viewerId != null) {
            best = attempts.findFirstByStudentIdAndQuizIdOrderByScoreDesc(viewerId, q.getId())
                .map(QuizAttempt::getScore).orElse(null);
        }
        return new QuizMeta(q.getId(), q.getTitle(), q.getQuestions().size(), best);
    }

    private int totalLessons(Course c) {
        return c.getModules().stream().mapToInt(m -> m.getLessons().size()).sum();
    }
}
