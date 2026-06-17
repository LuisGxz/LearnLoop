package dev.learnloop.api.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "quizzes")
@Getter
@Setter
@NoArgsConstructor
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id", nullable = false, unique = true)
    private CourseModule module;

    @Column(nullable = false)
    private String title;

    @Column(name = "passing_score", nullable = false)
    private int passingScore = 60; // percent

    @Column(name = "xp_reward", nullable = false)
    private int xpReward = 120;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Question> questions = new ArrayList<>();
}
