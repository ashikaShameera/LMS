package com.example.lms_back_end.dto.student;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentDto {
    private Long id;
    private String studentNo;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
}