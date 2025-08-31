package com.example.lms_back_end.dto.grade;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/** For instructors to record/update a grade */
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class GradeUpsertRequest {
    @NotNull private Long instructorId;
    @NotNull private Long studentId;
    @NotNull private Long courseId;
    @NotNull @Min(0) @Max(100) private Integer score;
}
