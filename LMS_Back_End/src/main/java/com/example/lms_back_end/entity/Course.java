package com.example.lms_back_end.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalTime;
import java.time.DayOfWeek;

@Entity
@Table(
        name = "courses",
        uniqueConstraints = @UniqueConstraint(name = "uk_courses_code", columnNames = "code")
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Size(max = 20)
    @Column(nullable = false, length = 20)
    private String code;

    @NotBlank @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    // --- added earlier ---
    @Size(max = 2000)
    @Column(length = 2000)
    private String description;

    @Size(max = 100)
    @Column(name = "lecture_hall", length = 100)
    private String lectureHall;

    @Column(name = "lecture_time")
    private LocalTime lectureTime;

    // --- NEW: lecture day ---
    @Enumerated(EnumType.STRING)
    @Column(name = "lecture_day", length = 16)
    private DayOfWeek lectureDay;

    @Column(name = "capacity")
    private Integer capacity; // null/0 => unlimited

    @Builder.Default
    @Column(name = "enrollment_open", nullable = false)
    private boolean enrollmentOpen = true;
}
