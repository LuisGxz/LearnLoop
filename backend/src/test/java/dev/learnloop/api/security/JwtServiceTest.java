package dev.learnloop.api.security;

import static org.assertj.core.api.Assertions.assertThat;

import dev.learnloop.api.domain.Role;
import dev.learnloop.api.domain.User;
import org.junit.jupiter.api.Test;

class JwtServiceTest {

    private static final String SECRET =
        "dGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtdGVzdC1zZWNyZXQtMDEyMzQ1Njc4OQ==";

    private final JwtService jwt = new JwtService(SECRET, 3_600_000);

    private User user() {
        User u = new User();
        u.setName("Maya Chen");
        u.setEmail("maya@learnloop.dev");
        u.setRole(Role.INSTRUCTOR);
        return u;
    }

    @Test
    void roundTripsAValidToken() {
        String token = jwt.generate(user());
        assertThat(jwt.validateAndGetSubject(token)).isEqualTo("maya@learnloop.dev");
    }

    @Test
    void rejectsTamperedToken() {
        String token = jwt.generate(user());
        String tampered = token.substring(0, token.length() - 3) + "abc";
        assertThat(jwt.validateAndGetSubject(tampered)).isNull();
    }

    @Test
    void rejectsGarbage() {
        assertThat(jwt.validateAndGetSubject("not-a-jwt")).isNull();
        assertThat(jwt.validateAndGetSubject("")).isNull();
    }

    @Test
    void rejectsTokenSignedWithAnotherSecret() {
        String other =
            "b3RoZXItc2VjcmV0LW90aGVyLXNlY3JldC1vdGhlci1zZWNyZXQtMDEyMzQ1Njc4OQ==";
        JwtService otherSvc = new JwtService(other, 3_600_000);
        String foreign = otherSvc.generate(user());
        assertThat(jwt.validateAndGetSubject(foreign)).isNull();
    }
}
