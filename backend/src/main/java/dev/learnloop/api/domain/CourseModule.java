package dev.learnloop.api.domain;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "modules")
@Getter
@Setter
@NoArgsConstructor
public class CourseModule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private int position;

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<Lesson> lessons = new ArrayList<>();

    @OneToOne(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    private Quiz quiz;
}
