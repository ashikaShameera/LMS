package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.enrollment.EnrollRequest;
import com.example.lms_back_end.dto.enrollment.EnrollmentDto;
import com.example.lms_back_end.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;  // <-- added
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService service;

    @PreAuthorize("hasRole('STUDENT') and #req.studentId == principal.studentId")
    @PostMapping
    public ResponseEntity<EnrollmentDto> enroll(@P("req") @Valid @RequestBody EnrollRequest req) { // <-- added
        return ResponseEntity.ok(service.enroll(req));
    }

    @PreAuthorize("hasRole('STUDENT') and #studentId == principal.studentId")
    @DeleteMapping
    public ResponseEntity<Void> unenroll(@P("studentId") @RequestParam Long studentId, // <-- added
                                         @RequestParam Long courseId) {
        service.unenroll(studentId, courseId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == principal.studentId)")
    @GetMapping("/students/{studentId}")
    public Page<EnrollmentDto> listByStudent(@P("studentId") @PathVariable Long studentId, // <-- added
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return service.listByStudent(studentId, page, size);
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @GetMapping("/courses/{courseId}")
    public Page<EnrollmentDto> listByCourse(@PathVariable Long courseId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "20") int size) {
        return service.listByCourse(courseId, page, size);
    }
}
