package com.example.lms_back_end.dto.enrollment;


import com.example.lms_back_end.entity.Enrollment;

public final class EnrollmentMapper {
    private EnrollmentMapper(){}

    public static EnrollmentDto toDto(Enrollment e) {
        return EnrollmentDto.builder()
                .id(e.getId())
                .studentId(e.getStudent().getId())
                .courseId(e.getCourse().getId())
                .active(e.isActive())
                .courseCode(e.getCourse().getCode())
                .courseTitle(e.getCourse().getTitle())
                .build();
    }
}
