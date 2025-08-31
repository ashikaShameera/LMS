package com.example.lms_back_end.dto.course;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalTime;
import java.time.DayOfWeek;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseUpdateRequest {
    @NotBlank @Size(max = 20)
    private String code;

    @NotBlank @Size(max = 200)
    private String title;

    @Size(max = 2000)
    private String description;

    @Size(max = 100)
    private String lectureHall;

    private LocalTime lectureTime;
    private DayOfWeek lectureDay;

    private Integer capacity;       // null or 0 → unlimited
    private boolean enrollmentOpen; // whether enrollment is open
}
