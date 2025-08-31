package com.example.lms_back_end.dto.enrollment;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EnrollRequest {
    @NotNull private Long studentId;
    @NotNull private Long courseId;
}
