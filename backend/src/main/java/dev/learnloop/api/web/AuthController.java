package dev.learnloop.api.web;

import dev.learnloop.api.repository.UserRepository;
import dev.learnloop.api.security.AppUserPrincipal;
import dev.learnloop.api.service.AuthService;
import dev.learnloop.api.web.dto.AuthDtos.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository users;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }

    @GetMapping("/me")
    public UserDto me(@AuthenticationPrincipal AppUserPrincipal principal) {
        if (principal == null) throw ApiException.forbidden("Not authenticated.");
        return users.findById(principal.getId())
            .map(UserDto::from)
            .orElseThrow(() -> ApiException.notFound("User not found."));
    }
}
