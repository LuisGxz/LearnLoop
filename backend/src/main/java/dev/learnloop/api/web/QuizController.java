package dev.learnloop.api.web;

import dev.learnloop.api.security.AppUserPrincipal;
import dev.learnloop.api.service.QuizService;
import dev.learnloop.api.web.dto.LearningDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/{id}")
    public QuizView view(@PathVariable Long id) {
        return quizService.view(id);
    }

    @PostMapping("/{id}/submit")
    public QuizResult submit(
        @PathVariable Long id, @Valid @RequestBody QuizSubmission submission,
        @AuthenticationPrincipal AppUserPrincipal me) {
        return quizService.submit(id, submission, me.getId());
    }
}
