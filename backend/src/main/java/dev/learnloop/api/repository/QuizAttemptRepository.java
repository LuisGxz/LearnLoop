package dev.learnloop.api.repository;

import dev.learnloop.api.domain.QuizAttempt;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizAttemptRepository extends JpaRepository<QuizAttempt, Long> {
    List<QuizAttempt> findByStudentIdOrderByTakenAtDesc(Long studentId);

    Optional<QuizAttempt> findFirstByStudentIdAndQuizIdOrderByScoreDesc(Long studentId, Long quizId);
}
