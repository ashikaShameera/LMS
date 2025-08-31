package com.example.lms_back_end.dto.student;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class StudentProfileUpdateRequest {
    @Size(max = 30)
    private String phone;

    @Size(max = 255)
    private String address;
}