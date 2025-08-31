package com.example.lms_back_end.dto.grade;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GradeDto {
    private Long id;
    private Long studentId;
    private Long courseId;
    private String courseCode;
    private String courseTitle;

    private Integer score;     // 0..100
    private String letter;     // e.g., A-, B+
    private double gradePoint; // 0.0..4.0
}