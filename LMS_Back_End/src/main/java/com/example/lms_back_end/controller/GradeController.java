package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.grade.GradeDto;
import com.example.lms_back_end.dto.grade.GradeSummaryDto;
import com.example.lms_back_end.dto.grade.GradeUpsertRequest;
import com.example.lms_back_end.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;  // <-- added
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService service;

    @PreAuthorize("hasRole('INSTRUCTOR')")
    @PostMapping
    public ResponseEntity<GradeDto> upsert(@Valid @RequestBody GradeUpsertRequest req) {
        return ResponseEntity.ok(service.upsert(req));
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == principal.studentId)")
    @GetMapping("/students/{studentId}")
    public Page<GradeDto> listByStudent(@P("studentId") @PathVariable Long studentId, // <-- added
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return service.listByStudent(studentId, page, size);
    }

    @PreAuthorize("hasAnyRole('ADMIN','INSTRUCTOR')")
    @GetMapping("/courses/{courseId}")
    public Page<GradeDto> listByCourse(@P("courseId") @PathVariable Long courseId,    // <-- added
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return service.listByCourse(courseId, page, size);
    }

    @PreAuthorize("hasRole('ADMIN') or (hasRole('STUDENT') and #studentId == principal.studentId)")
    @GetMapping("/students/{studentId}/summary")
    public GradeSummaryDto summaryByStudent(@P("studentId") @PathVariable Long studentId) { // <-- added
        return service.summaryByStudent(studentId);
    }
}
