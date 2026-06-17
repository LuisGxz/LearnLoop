package dev.learnloop.api.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "badges")
@Getter
@Setter
@NoArgsConstructor
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code; // FIRST_LESSON, QUIZ_ACE, COURSE_DONE, STREAK_7…

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, length = 300)
    private String description;

    @Column(nullable = false, length = 20)
    private String icon = "🏅";
}
