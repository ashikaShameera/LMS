package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.course.CourseMapper;
import com.example.lms_back_end.dto.instructor.*;
import com.example.lms_back_end.entity.Course;
import com.example.lms_back_end.entity.Instructor;
import com.example.lms_back_end.repository.CourseRepository;
import com.example.lms_back_end.repository.InstructorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class InstructorServiceImpl implements InstructorService {

    private final InstructorRepository repo;
    private final CourseRepository courseRepo;

    @Override
    @Transactional(readOnly = true)
    public Page<InstructorDto> list(String q, int page, int size) {
        String query = (q == null) ? "" : q;
        return repo.findByStaffNoContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        query, query, query, query, PageRequest.of(page, size))
                .map(InstructorMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public InstructorDto getById(Long id) {
        Instructor i = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));
        return InstructorMapper.toDto(i);
    }

    @Override
    public InstructorDto create(InstructorCreateRequest req) {
        if (repo.existsByStaffNoIgnoreCase(req.getStaffNo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Staff number already exists");
        }
        if (repo.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        Instructor saved = repo.save(InstructorMapper.fromCreate(req));
        return InstructorMapper.toDto(saved);
    }

    @Override
    public InstructorDto update(Long id, InstructorUpdateRequest req) {
        Instructor i = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));

        // If email changes, ensure uniqueness
        if (!i.getEmail().equalsIgnoreCase(req.getEmail()) && repo.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        InstructorMapper.applyUpdate(i, req);
        return InstructorMapper.toDto(repo.save(i));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found");
        }
        repo.deleteById(id);
    }

    // -------- Assignments --------

    @Override
    public void assignToCourse(Long instructorId, Long courseId) {
        Instructor i = repo.findById(instructorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // idempotent add
        if (!i.getCourses().contains(c)) {
            i.getCourses().add(c);
            repo.save(i);
        }
    }

    @Override
    public void unassignFromCourse(Long instructorId, Long courseId) {
        Instructor i = repo.findById(instructorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found"));
        Course c = courseRepo.findById(courseId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (i.getCourses().contains(c)) {
            i.getCourses().remove(c);
            repo.save(i);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDto> listAssignedCourses(Long instructorId, int page, int size) {
        if (!repo.existsById(instructorId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Instructor not found");
        }
        return repo.findCoursesByInstructorId(instructorId, PageRequest.of(page, size))
                .map(CourseMapper::toDto);
    }
}