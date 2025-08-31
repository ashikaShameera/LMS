package com.example.lms_back_end.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Entity
@Table(
        name = "students",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_students_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_students_student_no", columnNames = "student_no")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Official university identifier (immutable by student) */
    @NotBlank @Size(max = 20)
    @Column(name = "student_no", nullable = false, length = 20)
    private String studentNo;

    @NotBlank @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String firstName;

    @NotBlank @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String lastName;

    @NotBlank @Email @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String email;

    /** Non-authoritative fields students can edit */
    @Size(max = 30)
    private String phone;

    @Size(max = 255)
    private String address;
}
