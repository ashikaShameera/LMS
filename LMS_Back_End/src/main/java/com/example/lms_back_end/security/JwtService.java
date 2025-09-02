package com.example.lms_back_end.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {
    // Replace with config property; 256-bit secret
    private final Key key = Keys.hmacShaKeyFor("CHANGE_ME_TO_A_32+_CHAR_SECRET_KEY_CHANGE_ME".getBytes());

    public String generateToken(String username, Role role, Long userId, Long studentId, Long instructorId) {
        Instant now = Instant.now();
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role.name())   // role should not be null
                .claim("uid", userId)         // userId should not be null
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(now.plusSeconds(60L * 60L * 8L))) // 8h
                .signWith(key)
                .compact();
    }

    public Jws<Claims> parse(String token) {
        return Jwts.parser().verifyWith((SecretKey) key).build().parseSignedClaims(token);
    }
}
