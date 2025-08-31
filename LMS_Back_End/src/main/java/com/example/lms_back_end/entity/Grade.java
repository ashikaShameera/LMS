package com.example.lms_back_end.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;

@Entity
@Table(
        name = "grades",
        uniqueConstraints = @UniqueConstraint(name = "uk_grades_enrollment", columnNames = "enrollment_id")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Grade {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** One grade per enrollment (update-in-place if changed) */
    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    private Enrollment enrollment;

    /** Numeric score 0..100; map to letters/points in DTO/mapper */
    @Min(0) @Max(100)
    @Column(nullable = false)
    private Integer score;
}