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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService service;
    private final EnrollmentService enrollmentService;

    /** Admin list/search */
    @GetMapping
    public Page<StudentDto> list(@RequestParam(defaultValue = "") String q,
                                 @RequestParam(defaultValue = "0") int page,
                                 @RequestParam(defaultValue = "20") int size) {
        return service.list(q, page, size);
    }

    /** Admin or Student (self) view */
    @GetMapping("/{id}")
    public StudentDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    /** Admin creates a student record */
    @PostMapping
    public ResponseEntity<StudentDto> create(@Valid @RequestBody StudentCreateRequest req,
                                             UriComponentsBuilder uri) {
        StudentDto created = service.create(req);
        return ResponseEntity
                .created(uri.path("/api/students/{id}").build(created.getId()))
                .body(created);
    }

    /** Student updates only non-authoritative fields (phone, address) */
    @PutMapping("/{id}/profile")
    public StudentDto updateProfile(@PathVariable Long id,
                                    @Valid @RequestBody StudentProfileUpdateRequest req) {
        return service.updateProfile(id, req);
    }

    /** Optional: Admin delete */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{studentId}/courses")
    public Page<CourseDto> listEnrolledCourses(@PathVariable Long studentId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return enrollmentService.listCoursesForStudent(studentId, page, size);
    }
}