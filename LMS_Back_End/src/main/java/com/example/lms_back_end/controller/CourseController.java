package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.course.CourseCreateRequest;
import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.course.CourseUpdateRequest;
import com.example.lms_back_end.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService service;

    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public Page<CourseDto> list(
            @RequestParam(defaultValue = "") String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return service.list(q, page, size);
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public CourseDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<String> create(@Valid @RequestBody CourseCreateRequest req,
                                         UriComponentsBuilder uri) {
        CourseDto created = service.create(req);
        return ResponseEntity
                .status(201)
                .body("Course created successfully");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public CourseDto update(@PathVariable Long id, @Valid @RequestBody CourseUpdateRequest req) {
        return service.update(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
