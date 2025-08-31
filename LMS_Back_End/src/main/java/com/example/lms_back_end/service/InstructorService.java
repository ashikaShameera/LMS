package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.instructor.InstructorCreateRequest;
import com.example.lms_back_end.dto.instructor.*;
import com.example.lms_back_end.dto.instructor.InstructorUpdateRequest;
import org.springframework.data.domain.Page;

public interface InstructorService {
    Page<InstructorDto> list(String q, int page, int size);
    InstructorDto getById(Long id);
    InstructorDto create(InstructorCreateRequest req);InstructorDto update(Long id, InstructorUpdateRequest req);
    void delete(Long id);

    // Assignment APIs
    void assignToCourse(Long instructorId, Long courseId);
    void unassignFromCourse(Long instructorId, Long courseId);
    Page<CourseDto> listAssignedCourses(Long instructorId, int page, int size);
}