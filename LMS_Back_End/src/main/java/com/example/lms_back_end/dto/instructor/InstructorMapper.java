package com.example.lms_back_end.dto.instructor;

import com.example.lms_back_end.entity.Instructor;

public final class InstructorMapper {
    private InstructorMapper() {}

    public static InstructorDto toDto(Instructor i) {
        return InstructorDto.builder()
                .id(i.getId())
                .staffNo(i.getStaffNo())
                .firstName(i.getFirstName())
                .lastName(i.getLastName())
                .email(i.getEmail())
                .phone(i.getPhone())
                .build();
    }

    public static Instructor fromCreate(InstructorCreateRequest r) {
        return Instructor.builder()
                .staffNo(r.getStaffNo())
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .build();
    }

    public static void applyUpdate(Instructor i, InstructorUpdateRequest r) {
        i.setFirstName(r.getFirstName());
        i.setLastName(r.getLastName());
        i.setEmail(r.getEmail());
        i.setPhone(r.getPhone());
    }
}
