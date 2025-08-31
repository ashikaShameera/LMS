package com.example.lms_back_end.controller;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.instructor.*;
import com.example.lms_back_end.service.InstructorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/api/instructors")
@RequiredArgsConstructor
public class InstructorController {

    private final InstructorService service;

    // ---------- Admin: basic CRUD ----------
    @GetMapping
    public Page<InstructorDto> list(@RequestParam(defaultValue = "") String q,
                                    @RequestParam(defaultValue = "0") int page,
                                    @RequestParam(defaultValue = "20") int size) {
        return service.list(q, page, size);
    }

    @GetMapping("/{id}")
    public InstructorDto getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ResponseEntity<InstructorDto> create(@Valid @RequestBody InstructorCreateRequest req,
                                                UriComponentsBuilder uri) {
        InstructorDto created = service.create(req);
        return ResponseEntity
                .created(uri.path("/api/instructors/{id}").build(created.getId()))
                .body(created);
    }

    @PutMapping("/{id}")
    public InstructorDto update(@PathVariable Long id,
                                @Valid @RequestBody InstructorUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Assignments ----------
    /** Admin assigns instructor to a course */
    @PostMapping("/{instructorId}/courses/{courseId}")
    public ResponseEntity<Void> assignToCourse(@PathVariable Long instructorId,
                                               @PathVariable Long courseId) {
        service.assignToCourse(instructorId, courseId);
        return ResponseEntity.noContent().build(); // idempotent
    }

    /** Admin unassigns instructor from a course */
    @DeleteMapping("/{instructorId}/courses/{courseId}")
    public ResponseEntity<Void> unassignFromCourse(@PathVariable Long instructorId,
                                                   @PathVariable Long courseId) {
        service.unassignFromCourse(instructorId, courseId);
        return ResponseEntity.noContent().build();
    }

    /** Instructors view their assigned courses (later restrict to self via security) */
    @GetMapping("/{instructorId}/courses")
    public Page<CourseDto> listAssignedCourses(@PathVariable Long instructorId,
                                               @RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return service.listAssignedCourses(instructorId, page, size);
    }
}