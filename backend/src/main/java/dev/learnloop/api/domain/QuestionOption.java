package dev.learnloop.api.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "question_options")
@Getter
@Setter
@NoArgsConstructor
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(nullable = false, length = 400)
    private String text;

    @Column(nullable = false)
    private boolean correct = false;

    @Column(nullable = false)
    private int position;
}
