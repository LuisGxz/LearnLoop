package dev.learnloop.api.web;

import dev.learnloop.api.security.AppUserPrincipal;
import dev.learnloop.api.service.CourseService;
import dev.learnloop.api.service.EnrollmentService;
import dev.learnloop.api.web.dto.CourseDtos.CourseDetail;
import dev.learnloop.api.web.dto.LearningDtos.*;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LearningController {

    private final EnrollmentService enrollmentService;
    private final CourseService courseService;

    @PostMapping("/courses/{id}/enroll")
    public CourseDetail enroll(
        @PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal me) {
        enrollmentService.enroll(id, me.getId());
        return courseService.detail(id, me.getId());
    }

    @PostMapping("/lessons/{id}/complete")
    public CompleteLessonResult complete(
        @PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal me) {
        return enrollmentService.completeLesson(id, me.getId());
    }

    @GetMapping("/me/enrollments")
    public List<EnrollmentSummary> myEnrollments(@AuthenticationPrincipal AppUserPrincipal me) {
        return enrollmentService.myEnrollments(me.getId());
    }

    @GetMapping("/courses/{id}/certificate")
    public CertificateDto certificate(
        @PathVariable Long id, @AuthenticationPrincipal AppUserPrincipal me) {
        return enrollmentService.certificate(id, me.getId());
    }
}
