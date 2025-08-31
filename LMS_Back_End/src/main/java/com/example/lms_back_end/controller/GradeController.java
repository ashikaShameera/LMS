package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.grade.GradeDto;
import com.example.lms_back_end.dto.grade.GradeSummaryDto;
import com.example.lms_back_end.dto.grade.GradeUpsertRequest;
import com.example.lms_back_end.service.GradeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final GradeService service;

    /** Instructor records/updates a grade for a student in a course */
    @PostMapping
    public ResponseEntity<GradeDto> upsert(@Valid @RequestBody GradeUpsertRequest req) {
        return ResponseEntity.ok(service.upsert(req));
    }

    /** Student (or admin) views all their course grades */
    @GetMapping("/students/{studentId}")
    public Page<GradeDto> listByStudent(@PathVariable Long studentId,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "20") int size) {
        return service.listByStudent(studentId, page, size);
    }

    /** Admin/instructor can view grades for a course */
    @GetMapping("/courses/{courseId}")
    public Page<GradeDto> listByCourse(@PathVariable Long courseId,
                                       @RequestParam(defaultValue = "0") int page,
                                       @RequestParam(defaultValue = "20") int size) {
        return service.listByCourse(courseId, page, size);
    }

    /** Overall GPA/summary for a student */
    @GetMapping("/students/{studentId}/summary")
    public GradeSummaryDto summaryByStudent(@PathVariable Long studentId) {
        return service.summaryByStudent(studentId);
    }
}