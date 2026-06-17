package dev.learnloop.api.service;

import dev.learnloop.api.domain.Role;
import dev.learnloop.api.domain.User;
import dev.learnloop.api.repository.UserRepository;
import dev.learnloop.api.security.JwtService;
import dev.learnloop.api.web.ApiException;
import dev.learnloop.api.web.dto.AuthDtos.*;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final AuthenticationManager authManager;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().toLowerCase().trim();
        if (users.existsByEmailIgnoreCase(email)) {
            throw ApiException.conflict(
                "That email is already registered.",
                Map.of("email", "An account with this email already exists."));
        }
        User u = new User();
        u.setName(req.name().trim());
        u.setEmail(email);
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRole(req.role() == null ? Role.STUDENT : req.role());
        users.save(u);
        return new AuthResponse(jwtService.generate(u), UserDto.from(u));
    }

    public AuthResponse login(LoginRequest req) {
        String email = req.email().toLowerCase().trim();
        // Throws BadCredentialsException (→ 401) on a bad email/password.
        authManager.authenticate(new UsernamePasswordAuthenticationToken(email, req.password()));
        User u = users.findByEmailIgnoreCase(email).orElseThrow();
        return new AuthResponse(jwtService.generate(u), UserDto.from(u));
    }
}
