package dev.learnloop.api.repository;

import dev.learnloop.api.domain.Badge;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findByCode(String code);
}
