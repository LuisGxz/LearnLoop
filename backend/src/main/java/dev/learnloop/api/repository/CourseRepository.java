package dev.learnloop.api.repository;

import dev.learnloop.api.domain.Course;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByPublishedTrueOrderByCreatedAtDesc();

    List<Course> findByInstructorIdOrderByCreatedAtDesc(Long instructorId);
}
