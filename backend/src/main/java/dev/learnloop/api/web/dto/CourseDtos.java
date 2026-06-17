package dev.learnloop.api.web.dto;

import dev.learnloop.api.domain.LessonType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.List;

public final class CourseDtos {

    private CourseDtos() {}

    // ── Read ──────────────────────────────────────────────────────────

    public record CourseSummary(
        Long id, String title, String description, String category, String level,
        String coverGradient, String instructorName, int moduleCount, int lessonCount,
        int durationMin, boolean enrolled, Integer progressPercent) {}

    public record InstructorDto(Long id, String name, String title) {}

    public record LessonDetail(
        Long id, String title, LessonType type, int durationMin, String content,
        int position, int xpReward, boolean completed) {}

    public record QuizMeta(Long id, String title, int questionCount, Integer bestScore) {}

    public record ModuleDetail(
        Long id, String title, int position, List<LessonDetail> lessons, QuizMeta quiz) {}

    public record CourseDetail(
        Long id, String title, String description, String category, String level,
        String coverGradient, InstructorDto instructor, List<ModuleDetail> modules,
        boolean enrolled, int progressPercent, boolean completed) {}

    // ── Write (instructor) ────────────────────────────────────────────

    public record OptionInput(@NotBlank String text, boolean correct) {}

    public record QuestionInput(
        @NotBlank String text,
        String explanation,
        @Size(min = 2, message = "A question needs at least 2 options") @Valid List<OptionInput> options) {}

    public record QuizInput(
        @NotBlank String title,
        @Min(0) @Max(100) int passingScore,
        @Valid List<QuestionInput> questions) {}

    public record LessonInput(
        @NotBlank String title,
        @NotNull LessonType type,
        @Min(1) int durationMin,
        String content) {}

    public record ModuleInput(
        @NotBlank String title,
        @Valid List<LessonInput> lessons,
        @Valid QuizInput quiz) {}

    public record CourseInput(
        @NotBlank @Size(min = 4, message = "Title must be at least 4 characters") String title,
        @NotBlank @Size(min = 20, message = "Describe the course (min 20 characters)") String description,
        @NotBlank String category,
        @NotBlank String level,
        @NotBlank String coverGradient,
        @NotEmpty(message = "Add at least one module") @Valid List<ModuleInput> modules) {}
}
