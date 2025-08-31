package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.student.*;
import com.example.lms_back_end.entity.Student;
import com.example.lms_back_end.repository.StudentRepository;
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
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repo;

    @Override
    @Transactional(readOnly = true)
    public Page<StudentDto> list(String q, int page, int size) {
        String query = (q == null) ? "" : q;
        return repo.findByStudentNoContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                        query, query, query, query, PageRequest.of(page, size))
                .map(StudentMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDto getById(Long id) {
        Student s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        return StudentMapper.toDto(s);
    }

    @Override
    public StudentDto create(StudentCreateRequest req) {
        if (repo.existsByStudentNoIgnoreCase(req.getStudentNo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student number already exists");
        }
        if (repo.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }
        Student saved = repo.save(StudentMapper.fromCreate(req));
        return StudentMapper.toDto(saved);
    }

    @Override
    public StudentDto updateProfile(Long id, StudentProfileUpdateRequest req) {
        Student s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Only non-authoritative fields are changed here (phone, address)
        StudentMapper.applyProfileUpdate(s, req);
        return StudentMapper.toDto(repo.save(s));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        repo.deleteById(id);
    }
}