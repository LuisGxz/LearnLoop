package dev.learnloop.api.web.dto;

import dev.learnloop.api.domain.Role;
import dev.learnloop.api.domain.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {}

    public record RegisterRequest(
        @NotBlank(message = "Please enter your name") String name,
        @NotBlank @Email(message = "Enter a valid email address") String email,
        @NotBlank @Size(min = 8, message = "Password must be at least 8 characters") String password,
        Role role) {}

    public record LoginRequest(
        @NotBlank @Email(message = "Enter a valid email address") String email,
        @NotBlank(message = "Enter your password") String password) {}

    public record UserDto(
        Long id, String name, String email, Role role, int xp, int streakDays, String title) {
        public static UserDto from(User u) {
            return new UserDto(
                u.getId(), u.getName(), u.getEmail(), u.getRole(),
                u.getXp(), u.getStreakDays(), u.getTitle());
        }
    }

    public record AuthResponse(String token, UserDto user) {}
}
