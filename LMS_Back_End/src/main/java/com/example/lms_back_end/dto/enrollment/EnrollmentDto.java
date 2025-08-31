package com.example.lms_back_end.dto.enrollment;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EnrollmentDto {
    private Long id;
    private Long studentId;
    private Long courseId;
    private boolean active;

    // convenience
    private String courseCode;
    private String courseTitle;
}
