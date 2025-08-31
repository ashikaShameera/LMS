package com.example.lms_back_end.dto.student;


import com.example.lms_back_end.entity.Student;

public final class StudentMapper {
    private StudentMapper() {}

    public static StudentDto toDto(Student s) {
        return StudentDto.builder()
                .id(s.getId())
                .studentNo(s.getStudentNo())
                .firstName(s.getFirstName())
                .lastName(s.getLastName())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .build();
    }

    public static Student fromCreate(StudentCreateRequest r) {
        return Student.builder()
                .studentNo(r.getStudentNo())
                .firstName(r.getFirstName())
                .lastName(r.getLastName())
                .email(r.getEmail())
                .phone(r.getPhone())
                .address(r.getAddress())
                .build();
    }

    public static void applyProfileUpdate(Student s, StudentProfileUpdateRequest r) {
        s.setPhone(r.getPhone());
        s.setAddress(r.getAddress());
    }
}
