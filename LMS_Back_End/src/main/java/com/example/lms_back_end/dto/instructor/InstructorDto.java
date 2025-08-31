package com.example.lms_back_end.dto.instructor;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstructorDto {
    private Long id;
    private String staffNo;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
}