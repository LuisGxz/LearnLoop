package dev.learnloop.api.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "users", indexes = @Index(name = "idx_user_email", columnList = "email", unique = true))
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.STUDENT;

    @Column(name = "agent_title")
    private String title; // e.g. instructor headline

    @Column(nullable = false)
    private int xp = 0;

    @Column(name = "streak_days", nullable = false)
    private int streakDays = 0;

    @Column(name = "last_activity")
    private LocalDate lastActivity;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
