package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.student.StudentCreateRequest;
import com.example.lms_back_end.dto.student.StudentDto;
import com.example.lms_back_end.dto.student.StudentProfileUpdateRequest;
import com.example.lms_back_end.service.EnrollmentService;
import com.example.lms_back_end.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;  // <-- keep
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService service;
    private final EnrollmentService enrollmentService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<StudentDto> list(@RequestParam(defaultValue = "") String q,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size) {
        return service.list(q, page, size);
    }

    // UPDATED: allow instructors to view any student (for roster)
    @PreAuthorize("hasRole('ADMIN') or hasRole('INSTRUCTOR') or (hasRole('STUDENT') and #id == principal.studentId)")
    @GetMapping("/{id}")
    public StudentDto getById(@P("id") @PathVariable Long id) {
        return service.getById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<StudentDto> create(@Valid @RequestBody StudentCreateRequest req,
                                             UriComponentsBuilder uri) {
        StudentDto created = service.create(req);
        return ResponseEntity
                .created(uri.path("/api/students/{id}").build(created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #id == principal.studentId)")
    @PutMapping("/{id}/profile")
    public StudentDto updateProfile(@P("id") @PathVariable Long id,
                                    @Valid @RequestBody StudentProfileUpdateRequest req) {
        return service.updateProfile(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == principal.studentId)")
    @GetMapping("/{studentId}/courses")
    public Page<CourseDto> listEnrolledCourses(@P("studentId") @PathVariable Long studentId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return enrollmentService.listCoursesForStudent(studentId, page, size);
    }
}
