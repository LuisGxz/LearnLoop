package dev.learnloop.api.web;

import dev.learnloop.api.security.AppUserPrincipal;
import dev.learnloop.api.service.CourseService;
import dev.learnloop.api.web.dto.CourseDtos.*;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @GetMapping
    public List<CourseSummary> catalog(@AuthenticationPrincipal AppUserPrincipal me) {
        return courseService.catalog(me == null ? null : me.getId());
    }

    @GetMapping("/mine")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public List<CourseSummary> mine(@AuthenticationPrincipal AppUserPrincipal me) {
        return courseService.byInstructor(me.getId());
    }

    @GetMapping("/{id}")
    public CourseDetail detail(
        @PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal me) {
        return courseService.detail(id, me == null ? null : me.getId());
    }

    @PostMapping
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDetail create(
        @Valid @RequestBody CourseInput in, @AuthenticationPrincipal AppUserPrincipal me) {
        return courseService.create(in, me.getId());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    public CourseDetail update(
        @PathVariable Long id, @Valid @RequestBody CourseInput in,
        @AuthenticationPrincipal AppUserPrincipal me) {
        return courseService.update(id, in, me.getId());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal me) {
        courseService.delete(id, me.getId());
    }
}
