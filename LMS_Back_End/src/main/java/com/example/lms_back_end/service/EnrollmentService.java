package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.enrollment.EnrollRequest;
import com.example.lms_back_end.dto.enrollment.EnrollmentDto;
import com.example.lms_back_end.dto.student.StudentDto;
import org.springframework.data.domain.Page;

public interface EnrollmentService {
    EnrollmentDto enroll(EnrollRequest req);
    void unenroll(Long studentId, Long courseId);
    Page<EnrollmentDto> listByStudent(Long studentId, int page, int size);
    Page<EnrollmentDto> listByCourse(Long courseId, int page, int size);
    Page<CourseDto> listCoursesForStudent(Long studentId, int page, int size);
    Page<StudentDto> listStudentsForCourse(Long courseId, int page, int size);
}