package com.example.lms_back_end.security;

import com.example.lms_back_end.dto.security.AuthRequest;
import com.example.lms_back_end.dto.security.AuthResponse;
import com.example.lms_back_end.repository.AppUserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authManager;
    private final JwtService jwt;
    private final AppUserRepository users;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest req) {
        try {
            var auth = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.getUsername(), req.getPassword()));
            var principal = (CurrentUser) auth.getPrincipal();

            String token = jwt.generateToken(
                    principal.getUsername(),
                    principal.getRole(),
                    principal.getId(),
                    principal.getStudentId(),
                    principal.getInstructorId());

            return ResponseEntity.ok(AuthResponse.builder()
                    .token(token)
                    .role(principal.getRole())
                    .userId(principal.getId())
                    .studentId(principal.getStudentId())
                    .instructorId(principal.getInstructorId())
                    .build());
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(401).build();
        }
    }
}

