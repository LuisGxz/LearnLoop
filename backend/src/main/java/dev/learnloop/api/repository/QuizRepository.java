package dev.learnloop.api.repository;

import dev.learnloop.api.domain.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizRepository extends JpaRepository<Quiz, Long> {}
