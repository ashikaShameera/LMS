package com.example.lms_back_end.dto.course;

import lombok.*;
import java.time.LocalTime;
import java.time.DayOfWeek;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CourseDto {
    private Long id;
    private String code;
    private String title;

    private String description;
    private String lectureHall;
    private LocalTime lectureTime;
    private DayOfWeek lectureDay;

    private Integer capacity;
    private boolean enrollmentOpen;
}
