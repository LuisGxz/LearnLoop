package dev.learnloop.api.service;

import dev.learnloop.api.domain.Badge;
import dev.learnloop.api.domain.User;
import dev.learnloop.api.domain.UserBadge;
import dev.learnloop.api.repository.BadgeRepository;
import dev.learnloop.api.repository.UserBadgeRepository;
import dev.learnloop.api.repository.UserRepository;
import dev.learnloop.api.web.dto.LearningDtos.BadgeDto;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/** XP, daily streak and badge awarding — shared by lesson completion and quizzes. */
@Service
@RequiredArgsConstructor
public class GamificationService {

    private final UserRepository users;
    private final BadgeRepository badges;
    private final UserBadgeRepository userBadges;

    public void addXp(User user, int amount) {
        user.setXp(user.getXp() + amount);
    }

    /** Updates the streak based on the last activity date. Returns true if it grew. */
    public void touchStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastActivity();
        if (last == null || last.isBefore(today.minusDays(1))) {
            user.setStreakDays(1);
        } else if (last.equals(today.minusDays(1))) {
            user.setStreakDays(user.getStreakDays() + 1);
        } // last == today → unchanged
        user.setLastActivity(today);
    }

    /** Awards a badge if the user doesn't have it yet; returns it (or null). */
    public BadgeDto awardIfAbsent(User user, String code) {
        Badge badge = badges.findByCode(code).orElse(null);
        if (badge == null) return null;
        if (userBadges.existsByUserIdAndBadgeId(user.getId(), badge.getId())) return null;
        UserBadge ub = new UserBadge();
        ub.setUser(user);
        ub.setBadge(badge);
        userBadges.save(ub);
        return toDto(badge);
    }

    public List<BadgeDto> checkStreakBadges(User user) {
        List<BadgeDto> awarded = new ArrayList<>();
        if (user.getStreakDays() >= 7) {
            BadgeDto b = awardIfAbsent(user, "STREAK_7");
            if (b != null) awarded.add(b);
        }
        return awarded;
    }

    public void save(User user) {
        users.save(user);
    }

    public static BadgeDto toDto(Badge b) {
        return new BadgeDto(b.getCode(), b.getName(), b.getDescription(), b.getIcon());
    }
}
