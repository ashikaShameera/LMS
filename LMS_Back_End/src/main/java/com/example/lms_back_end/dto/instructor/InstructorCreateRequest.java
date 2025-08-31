package com.example.lms_back_end.dto.instructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InstructorCreateRequest {
    @NotBlank @Size(max = 20)  private String staffNo;
    @NotBlank @Size(max = 60)  private String firstName;
    @NotBlank @Size(max = 60)  private String lastName;
    @NotBlank @Email @Size(max = 120) private String email;
    @Size(max = 30)            private String phone;
}