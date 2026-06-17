package dev.learnloop.api.security;

import dev.learnloop.api.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
        @Value("${learnloop.jwt.secret}") String secret,
        @Value("${learnloop.jwt.expiration-ms}") long expirationMs) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationMs = expirationMs;
    }

    public String generate(User user) {
        Date now = new Date();
        return Jwts.builder()
            .subject(user.getEmail())
            .claim("uid", user.getId())
            .claim("role", user.getRole().name())
            .claim("name", user.getName())
            .issuedAt(now)
            .expiration(new Date(now.getTime() + expirationMs))
            .signWith(key)
            .compact();
    }

    /** Returns the subject (email) if valid, or null. */
    public String validateAndGetSubject(String token) {
        try {
            Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }
}
