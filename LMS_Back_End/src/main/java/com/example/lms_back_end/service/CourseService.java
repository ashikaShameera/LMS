package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.course.CourseCreateRequest;
import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.course.CourseUpdateRequest;
import org.springframework.data.domain.Page;

public interface CourseService {
    Page<CourseDto> list(String query, int page, int size);
    CourseDto getById(Long id);
    CourseDto create(CourseCreateRequest req);
    CourseDto update(Long id, CourseUpdateRequest req);
    void delete(Long id);
}