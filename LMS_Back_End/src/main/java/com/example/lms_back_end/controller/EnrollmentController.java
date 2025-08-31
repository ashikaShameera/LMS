package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.enrollment.EnrollRequest;
import com.example.lms_back_end.dto.enrollment.EnrollmentDto;
import com.example.lms_back_end.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService service;

    @PostMapping
    public ResponseEntity<EnrollmentDto> enroll(@Valid @RequestBody EnrollRequest req) {
        return ResponseEntity.ok(service.enroll(req));
    }

    @DeleteMapping
    public ResponseEntity<Void> unenroll(@RequestParam Long studentId, @RequestParam Long courseId) {
        service.unenroll(studentId, courseId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/students/{studentId}")
    public Page<EnrollmentDto> listByStudent(@PathVariable Long studentId,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return service.listByStudent(studentId, page, size);
    }

    @GetMapping("/courses/{courseId}")
    public Page<EnrollmentDto> listByCourse(@PathVariable Long courseId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return service.listByCourse(courseId, page, size);
    }
}

