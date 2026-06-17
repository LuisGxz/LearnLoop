package dev.learnloop.api.repository;

import dev.learnloop.api.domain.LessonProgress;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    List<LessonProgress> findByEnrollmentId(Long enrollmentId);

    long countByEnrollmentId(Long enrollmentId);

    boolean existsByEnrollmentIdAndLessonId(Long enrollmentId, Long lessonId);
}
