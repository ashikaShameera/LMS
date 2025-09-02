package com.example.lms_back_end.dto.security;

import com.example.lms_back_end.security.Role;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AuthResponse {
    private String token;
    private Role role;
    private Long userId;
    private Long studentId;    // if applicable
    private Long instructorId; // if applicable
}