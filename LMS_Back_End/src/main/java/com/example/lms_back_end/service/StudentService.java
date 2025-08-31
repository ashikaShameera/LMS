package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.student.StudentCreateRequest;
import com.example.lms_back_end.dto.student.StudentDto;
import com.example.lms_back_end.dto.student.StudentProfileUpdateRequest;
import org.springframework.data.domain.Page;

public interface StudentService {
    Page<StudentDto> list(String q, int page, int size);          // Admin view/list
    StudentDto getById(Long id);                                  // Admin or Student (self)
    StudentDto create(StudentCreateRequest req);                   // Admin creates
    StudentDto updateProfile(Long id, StudentProfileUpdateRequest req); // Student self-update
    void delete(Long id);                                         // Optional (Admin)
}