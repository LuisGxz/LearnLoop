package dev.learnloop.api.web.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public final class LearningDtos {

    private LearningDtos() {}

    // ── Quiz taking ───────────────────────────────────────────────────

    public record OptionView(Long id, String text) {}

    public record QuestionView(Long id, String text, List<OptionView> options) {}

    public record QuizView(Long id, String title, int passingScore, List<QuestionView> questions) {}

    public record Answer(@NotNull Long questionId, @NotNull Long optionId) {}

    public record QuizSubmission(List<Answer> answers) {}

    public record QuestionResult(
        Long questionId, Long correctOptionId, Long chosenOptionId,
        boolean correct, String explanation) {}

    public record QuizResult(
        int score, int correctCount, int totalCount, boolean passed,
        int xpEarned, int totalXp, List<QuestionResult> questions, List<BadgeDto> newBadges) {}

    // ── Progress / gamification ───────────────────────────────────────

    public record BadgeDto(String code, String name, String description, String icon) {}

    public record CompleteLessonResult(
        int xpEarned, int totalXp, int streakDays, int progressPercent,
        boolean courseCompleted, List<BadgeDto> newBadges) {}

    public record EnrollmentSummary(
        Long courseId, String title, String coverGradient, String category,
        int progressPercent, boolean completed) {}

    public record CertificateDto(
        Long courseId, String courseTitle, String studentName,
        String instructorName, String issuedAt) {}
}
