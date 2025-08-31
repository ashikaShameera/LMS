package com.example.lms_back_end.dto.course;

import com.example.lms_back_end.entity.Course;

public final class CourseMapper {
    private CourseMapper() {}

    public static CourseDto toDto(Course c) {
        return CourseDto.builder()
                .id(c.getId())
                .code(c.getCode())
                .title(c.getTitle())
                .description(c.getDescription())
                .lectureHall(c.getLectureHall())
                .lectureTime(c.getLectureTime())
                .lectureDay(c.getLectureDay())
                .capacity(c.getCapacity())
                .enrollmentOpen(c.isEnrollmentOpen())
                .build();
    }

    public static Course fromCreate(CourseCreateRequest r) {
        return Course.builder()
                .code(r.getCode())
                .title(r.getTitle())
                .description(r.getDescription())
                .lectureHall(r.getLectureHall())
                .lectureTime(r.getLectureTime())
                .lectureDay(r.getLectureDay())
                .capacity(r.getCapacity())
                .enrollmentOpen(r.isEnrollmentOpen())
                .build();
    }

    public static void applyUpdate(Course c, CourseUpdateRequest r) {
        c.setCode(r.getCode());
        c.setTitle(r.getTitle());
        c.setDescription(r.getDescription());
        c.setLectureHall(r.getLectureHall());
        c.setLectureTime(r.getLectureTime());
        c.setLectureDay(r.getLectureDay());
        c.setCapacity(r.getCapacity());
        c.setEnrollmentOpen(r.isEnrollmentOpen());
    }
}
