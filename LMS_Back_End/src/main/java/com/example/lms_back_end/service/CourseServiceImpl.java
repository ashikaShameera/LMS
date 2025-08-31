package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.course.CourseCreateRequest;
import com.example.lms_back_end.dto.course.CourseDto;
import com.example.lms_back_end.dto.course.CourseMapper;
import com.example.lms_back_end.dto.course.CourseUpdateRequest;
import com.example.lms_back_end.entity.Course;
import com.example.lms_back_end.repository.CourseRepository;
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
public class CourseServiceImpl implements CourseService {

    private final CourseRepository repo;

    @Override
    @Transactional(readOnly = true)
    public Page<CourseDto> list(String query, int page, int size) {
        return repo.findByCodeContainingIgnoreCaseOrTitleContainingIgnoreCase(
                        query == null ? "" : query,
                        query == null ? "" : query,
                        PageRequest.of(page, size)
                )
                .map(CourseMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDto getById(Long id) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));
        return CourseMapper.toDto(c);
    }

    @Override
    public CourseDto create(CourseCreateRequest req) {
        if (repo.existsByCodeIgnoreCase(req.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course code already exists");
        }
        Course saved = repo.save(CourseMapper.fromCreate(req));
        return CourseMapper.toDto(saved);
    }

    @Override
    public CourseDto update(Long id, CourseUpdateRequest req) {
        Course c = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        if (!c.getCode().equalsIgnoreCase(req.getCode()) && repo.existsByCodeIgnoreCase(req.getCode())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Course code already exists");
        }

        CourseMapper.applyUpdate(c, req);
        return CourseMapper.toDto(repo.save(c));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found");
        }
        repo.deleteById(id);
    }
}