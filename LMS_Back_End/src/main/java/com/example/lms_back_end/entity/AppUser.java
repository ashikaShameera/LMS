package com.example.lms_back_end.entity;

import com.example.lms_back_end.security.Role;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity @Table(name = "users", uniqueConstraints = @UniqueConstraint(name="uk_users_username", columnNames="username"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;

    @NotBlank @Column(nullable=false, length=80) private String username; // email or login
    @NotBlank @Column(nullable=false) private String password;            // BCrypt encoded
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20) private Role role;

    // Optional links (helpful for @PreAuthorize checks)
    private Long studentId;    // if role=STUDENT
    private Long instructorId; // if role=INSTRUCTOR
}
