package dev.learnloop.api.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "lesson_progress",
    uniqueConstraints = @UniqueConstraint(name = "uk_lesson_progress", columnNames = {"enrollment_id", "lesson_id"}))
@Getter
@Setter
@NoArgsConstructor
public class LessonProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "completed_at", nullable = false)
    private Instant completedAt = Instant.now();
}
