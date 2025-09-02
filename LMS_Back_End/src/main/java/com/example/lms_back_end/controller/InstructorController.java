package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.instructor.*;
import com.example.lms_back_end.service.InstructorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.parameters.P;  // <-- keep
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService service;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<InstructorDto> list(@RequestParam(defaultValue = "") String q,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return service.list(q, page, size);
    }

    // UPDATED: allow instructor to view their own profile
    @PreAuthorize("hasRole('ADMIN') or (hasRole('INSTRUCTOR') and #id == principal.instructorId)")
    @GetMapping("/{id}")
    public InstructorDto getById(@P("id") @PathVariable Long id) {
        return service.getById(id);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<InstructorDto> create(@Valid @RequestBody InstructorCreateRequest req,
                                                UriComponentsBuilder uri) {
        InstructorDto created = service.create(req);
        return ResponseEntity
                .created(uri.path("/api/instructors/{id}").build(created.getId()))
                .body(created);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public InstructorDto update(@PathVariable Long id,
                                @Valid @RequestBody InstructorUpdateRequest req) {
        return service.update(id, req);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{instructorId}/courses/{courseId}")
    public ResponseEntity<Void> assignToCourse(@PathVariable Long instructorId,
                                               @PathVariable Long courseId) {
        service.assignToCourse(instructorId, courseId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{instructorId}/courses/{courseId}")
    public ResponseEntity<Void> unassignFromCourse(@PathVariable Long instructorId,
                                                   @PathVariable Long courseId) {
        service.unassignFromCourse(instructorId, courseId);
        return ResponseEntity.noContent().build();
    }

    /** Admin OR the instructor themself */
    @PreAuthorize("hasRole('ADMIN') or (hasRole('INSTRUCTOR') and #instructorId == principal.instructorId)")
    @GetMapping("/{instructorId}/courses")
    public Page<CourseDto> listAssignedCourses(@P("instructorId") @PathVariable Long instructorId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return service.listAssignedCourses(instructorId, page, size);
    }
}
