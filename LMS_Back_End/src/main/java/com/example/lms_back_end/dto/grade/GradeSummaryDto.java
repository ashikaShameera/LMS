package com.example.lms_back_end.dto.grade;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GradeSummaryDto {
    private Long studentId;
    private int gradedCourses;
    private double gpa; // 4.0 scale, unweighted
}