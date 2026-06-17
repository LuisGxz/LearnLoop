package dev.learnloop.api.domain;

import jakarta.persistence.*;
import java.time.Instant;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(
    name = "user_badges",
    uniqueConstraints = @UniqueConstraint(name = "uk_user_badge", columnNames = {"user_id", "badge_id"}))
@Getter
@Setter
@NoArgsConstructor
public class UserBadge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "badge_id", nullable = false)
    private Badge badge;

    @Column(name = "earned_at", nullable = false, updatable = false)
    private Instant earnedAt = Instant.now();
}
