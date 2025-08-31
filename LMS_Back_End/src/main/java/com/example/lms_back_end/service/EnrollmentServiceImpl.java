package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.course.CourseMapper;
import com.example.lms_back_end.dto.enrollment.EnrollRequest;
import com.example.lms_back_end.dto.enrollment.EnrollmentDto;
import com.example.lms_back_end.dto.enrollment.EnrollmentMapper;
import com.example.lms_back_end.dto.student.StudentMapper;
import com.example.lms_back_end.dto.student.StudentDto;
import com.example.lms_back_end.entity.Course;
import com.example.lms_back_end.entity.Enrollment;
import com.example.lms_back_end.entity.Student;
import com.example.lms_back_end.repository.CourseRepository;
import com.example.lms_back_end.repository.EnrollmentRepository;
import com.example.lms_back_end.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository repo;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;

    @Override
    public EnrollmentDto enroll(EnrollRequest req) {
        Student student = studentRepo.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!course.isEnrollmentOpen()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Enrollment is closed for this course");
        }

        // prevent duplicates of active enrollment
        if (repo.existsByStudent_IdAndCourse_IdAndActive(student.getId(), course.getId(), true)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already enrolled");
        }

        // capacity check counts only active enrollments
        Integer cap = course.getCapacity();
        if (cap != null && cap > 0) {
            long current = repo.countByCourse_IdAndActive(course.getId(), true);
            if (current >= cap) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Course capacity reached");
            }
        }

        Enrollment saved = repo.save(Enrollment.builder()
                .student(student)
                .course(course)
                .active(true)
                .build());

        return EnrollmentMapper.toDto(saved);
    }

    @Override
    public void unenroll(Long studentId, Long courseId) {
        Enrollment e = repo.findByStudent_IdAndCourse_IdAndActive(studentId, courseId, true)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Active enrollment not found"));

        e.setActive(false); // soft “drop”
        repo.save(e);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnrollmentDto> listByStudent(Long studentId, int page, int size) {
        if (!studentRepo.existsById(studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        return repo.findByStudent_IdAndActive(studentId, true, PageRequest.of(page, size))
                .map(EnrollmentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EnrollmentDto> listByCourse(Long courseId, int page, int size) {
        if (!courseRepo.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        return repo.findByCourse_IdAndActive(courseId, true, PageRequest.of(page, size))
                .map(EnrollmentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDto> listCoursesForStudent(Long studentId, int page, int size) {
        if (!studentRepo.existsById(studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        var pageable = PageRequest.of(page, size);
        var enrollments = repo.findByStudent_IdAndActive(studentId, true, pageable);
        var content = enrollments.getContent().stream()
                .map(e -> CourseMapper.toDto(e.getCourse()))
                .toList();
        return new PageImpl<>(content, pageable, enrollments.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudentDto> listStudentsForCourse(Long courseId, int page, int size) {
        if (!courseRepo.existsById(courseId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        var pageable = PageRequest.of(page, size);
        var enrollments = repo.findByCourse_IdAndActive(courseId, true, pageable);
        var content = enrollments.getContent().stream()
                .map(e -> StudentMapper.toDto(e.getStudent()))
                .toList();
        return new PageImpl<>(content, pageable, enrollments.getTotalElements());
    }


}