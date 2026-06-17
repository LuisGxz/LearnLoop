package dev.learnloop.api.repository;

import dev.learnloop.api.domain.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {}
