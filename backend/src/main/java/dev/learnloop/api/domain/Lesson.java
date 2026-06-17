package dev.learnloop.api.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false)
    private CourseModule module;

    @Column(nullable = false)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private LessonType type = LessonType.VIDEO;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "duration_min", nullable = false)
    private int durationMin;

    @Column(nullable = false)
    private int position;

    /** XP awarded for completing this lesson. */
    @Column(name = "xp_reward", nullable = false)
    private int xpReward = 50;
}
