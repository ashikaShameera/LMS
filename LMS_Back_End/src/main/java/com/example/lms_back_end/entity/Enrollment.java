package com.example.lms_back_end.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(
        name = "enrollments",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_enrollment_active_pair",
                columnNames = {"student_id", "course_id", "active"}
        )
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Enrollment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    /** true = current enrollment, false = previously dropped (soft “delete”) */
    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}