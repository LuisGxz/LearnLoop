package dev.learnloop.api.service;

import dev.learnloop.api.domain.*;
import dev.learnloop.api.repository.*;
import dev.learnloop.api.web.ApiException;
import dev.learnloop.api.web.dto.LearningDtos.*;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollments;
    private final LessonProgressRepository progress;
    private final LessonRepository lessons;
    private final CourseRepository courses;
    private final UserRepository users;
    private final GamificationService gamification;

    @Transactional
    public void enroll(Long courseId, Long studentId) {
        if (enrollments.existsByStudentIdAndCourseId(studentId, courseId)) return;
        Course c = courses.findById(courseId)
            .orElseThrow(() -> ApiException.notFound("Course not found."));
        User student = users.findById(studentId).orElseThrow();
        Enrollment e = new Enrollment();
        e.setStudent(student);
        e.setCourse(c);
        enrollments.save(e);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentSummary> myEnrollments(Long studentId) {
        List<EnrollmentSummary> out = new ArrayList<>();
        for (Enrollment e : enrollments.findByStudentIdOrderByEnrolledAtDesc(studentId)) {
            Course c = e.getCourse();
            int total = totalLessons(c);
            long done = progress.countByEnrollmentId(e.getId());
            int pct = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
            out.add(new EnrollmentSummary(
                c.getId(), c.getTitle(), c.getCoverGradient(), c.getCategory(),
                pct, e.getCompletedAt() != null));
        }
        return out;
    }

    @Transactional
    public CompleteLessonResult completeLesson(Long lessonId, Long studentId) {
        Lesson lesson = lessons.findById(lessonId)
            .orElseThrow(() -> ApiException.notFound("Lesson not found."));
        Course course = lesson.getModule().getCourse();
        Enrollment enr = enrollments.findByStudentIdAndCourseId(studentId, course.getId())
            .orElseThrow(() -> ApiException.forbidden("Enroll in the course first."));
        User student = users.findById(studentId).orElseThrow();

        List<BadgeDto> newBadges = new ArrayList<>();
        boolean firstTime = !progress.existsByEnrollmentIdAndLessonId(enr.getId(), lessonId);
        int xpEarned = 0;

        if (firstTime) {
            LessonProgress lp = new LessonProgress();
            lp.setEnrollment(enr);
            lp.setLesson(lesson);
            progress.save(lp);

            xpEarned = lesson.getXpReward();
            gamification.addXp(student, xpEarned);
            gamification.touchStreak(student);

            BadgeDto first = gamification.awardIfAbsent(student, "FIRST_LESSON");
            if (first != null) newBadges.add(first);
            newBadges.addAll(gamification.checkStreakBadges(student));
        }

        int total = totalLessons(course);
        long done = progress.countByEnrollmentId(enr.getId());
        int pct = total == 0 ? 0 : (int) Math.round(done * 100.0 / total);
        boolean courseCompleted = total > 0 && done >= total;
        if (courseCompleted && enr.getCompletedAt() == null) {
            enr.setCompletedAt(Instant.now());
            BadgeDto cd = gamification.awardIfAbsent(student, "COURSE_DONE");
            if (cd != null) newBadges.add(cd);
        }
        gamification.save(student);

        return new CompleteLessonResult(
            xpEarned, student.getXp(), student.getStreakDays(), pct, courseCompleted, newBadges);
    }

    @Transactional(readOnly = true)
    public CertificateDto certificate(Long courseId, Long studentId) {
        Enrollment enr = enrollments.findByStudentIdAndCourseId(studentId, courseId)
            .orElseThrow(() -> ApiException.notFound("Not enrolled."));
        if (enr.getCompletedAt() == null) {
            throw ApiException.forbidden("Finish the course to unlock the certificate.");
        }
        Course c = enr.getCourse();
        String issued = DateTimeFormatter.ISO_LOCAL_DATE
            .withZone(ZoneId.systemDefault()).format(enr.getCompletedAt());
        return new CertificateDto(
            c.getId(), c.getTitle(), enr.getStudent().getName(),
            c.getInstructor().getName(), issued);
    }

    private int totalLessons(Course c) {
        return c.getModules().stream().mapToInt(m -> m.getLessons().size()).sum();
    }
}
