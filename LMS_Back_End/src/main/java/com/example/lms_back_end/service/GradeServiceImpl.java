package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.grade.*;
import com.example.lms_back_end.entity.Course;
import com.example.lms_back_end.entity.Enrollment;
import com.example.lms_back_end.entity.Grade;
import com.example.lms_back_end.entity.Student;
import com.example.lms_back_end.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class GradeServiceImpl implements GradeService {

    private final GradeRepository repo;
    private final EnrollmentRepository enrollmentRepo;
    private final StudentRepository studentRepo;
    private final CourseRepository courseRepo;
    private final InstructorRepository instructorRepo;

    @Override
    public GradeDto upsert(GradeUpsertRequest req) {
        Student student = studentRepo.findById(req.getStudentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        Course course = courseRepo.findById(req.getCourseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // Ensure instructor is assigned to this course
        if (!instructorRepo.existsByIdAndCourses_Id(req.getInstructorId(), course.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Instructor not assigned to this course");
        }

        // Must have an active enrollment to grade
        Enrollment enrollment = enrollmentRepo.findByStudent_IdAndCourse_IdAndActive(student.getId(), course.getId(), true)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.CONFLICT, "Student is not actively enrolled"));

        // Upsert single grade per enrollment
        Grade grade = repo.findByEnrollment_Student_IdAndEnrollment_Course_Id(student.getId(), course.getId())
                .orElse(Grade.builder().enrollment(enrollment).build());

        grade.setScore(req.getScore());
        Grade saved = repo.save(grade);
        return GradeMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GradeDto> listByStudent(Long studentId, int page, int size) {
        if (!studentRepo.existsById(studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        var pageable = PageRequest.of(page, size);
        // Simple manual pagination since repo returns List for student
        List<Grade> all = repo.findByEnrollment_Student_Id(studentId);
        int from = Math.min((int) pageable.getOffset(), all.size());
        int to = Math.min(from + pageable.getPageSize(), all.size());
        List<GradeDto> slice = all.subList(from, to).stream().map(GradeMapper::toDto).toList();
        return new PageImpl<>(slice, pageable, all.size());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GradeDto> listByCourse(Long courseId, int page, int size) {
        var pageable = PageRequest.of(page, size);
        // If you want paging from DB, add a paging query; here we reuse student-based approach
        courseRepo.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        // Quick fetch-all by course via enrollmentRepo -> join in memory
        var enrollments = enrollmentRepo.findByCourse_IdAndActive(courseId, true, PageRequest.of(0, Integer.MAX_VALUE)).getContent();
        var grades = enrollments.stream().map(e ->
                        repo.findByEnrollment_Student_IdAndEnrollment_Course_Id(e.getStudent().getId(), courseId).orElse(null))
                .filter(g -> g != null).toList();
        int from = Math.min((int) pageable.getOffset(), grades.size());
        int to = Math.min(from + pageable.getPageSize(), grades.size());
        var slice = grades.subList(from, to).stream().map(GradeMapper::toDto).toList();
        return new PageImpl<>(slice, pageable, grades.size());
    }

    @Override
    @Transactional(readOnly = true)
    public GradeSummaryDto summaryByStudent(Long studentId) {
        if (!studentRepo.existsById(studentId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        List<Grade> grades = repo.findByEnrollment_Student_Id(studentId);
        if (grades.isEmpty()) {
            return GradeSummaryDto.builder().studentId(studentId).gradedCourses(0).gpa(0.0).build();
        }
        double gpa = grades.stream()
                .mapToDouble(g -> GradeMapper.gradePoint(g.getScore()))
                .average()
                .orElse(0.0);
        return GradeSummaryDto.builder()
                .studentId(studentId)
                .gradedCourses(grades.size())
                .gpa(Math.round(gpa * 100.0) / 100.0) // round to 2 dp
                .build();
    }
}
