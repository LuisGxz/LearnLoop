package dev.learnloop.api.repository;

import dev.learnloop.api.domain.UserBadge;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {
    List<UserBadge> findByUserId(Long userId);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);
}
