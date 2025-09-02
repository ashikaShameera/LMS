package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.student.StudentCreateRequest;
import com.example.lms_back_end.dto.student.StudentDto;
import com.example.lms_back_end.dto.student.StudentMapper;
import com.example.lms_back_end.dto.student.StudentProfileUpdateRequest;
import com.example.lms_back_end.entity.AppUser;
import com.example.lms_back_end.entity.Student;
import com.example.lms_back_end.repository.AppUserRepository;
import com.example.lms_back_end.repository.StudentRepository;
import com.example.lms_back_end.security.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional
public class StudentServiceImpl implements StudentService {

    private final StudentRepository repo;
    private final AppUserRepository userRepo;
    private final PasswordEncoder passwordEncoder;

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
        // Uniqueness checks
        if (repo.existsByStudentNoIgnoreCase(req.getStudentNo())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student number already exists");
        }
        if (repo.existsByEmailIgnoreCase(req.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        // 1) Persist Student
        Student saved = repo.save(StudentMapper.fromCreate(req));

        // 2) Ensure AppUser exists & is linked (username = email)
        final String username = req.getEmail().trim().toLowerCase();

        userRepo.findByUsernameIgnoreCase(username).ifPresentOrElse(existing -> {
            boolean dirty = false;

            // Link studentId if missing/different
            if (existing.getStudentId() == null || !existing.getStudentId().equals(saved.getId())) {
                existing.setStudentId(saved.getId());
                dirty = true;
            }
            // Ensure role is STUDENT
            if (existing.getRole() != Role.STUDENT) {
                existing.setRole(Role.STUDENT);
                dirty = true;
            }
            if (dirty) userRepo.save(existing);
        }, () -> {
            // Create new AppUser with a dev password (replace with reset flow for prod)
            String initialPassword = "ChangeMe123!"; // TODO: replace with your policy / reset flow
            AppUser user = AppUser.builder()
                    .username(username)
                    .password(passwordEncoder.encode(initialPassword))
                    .role(Role.STUDENT)
                    .studentId(saved.getId())
                    .build();
            userRepo.save(user);
        });

        return StudentMapper.toDto(saved);
    }

    @Override
    public StudentDto updateProfile(Long id, StudentProfileUpdateRequest req) {
        Student s = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));

        // Apply only non-authoritative fields (mapper should restrict to e.g. phone/address)
        StudentMapper.applyProfileUpdate(s, req);
        return StudentMapper.toDto(repo.save(s));
    }

    @Override
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found");
        }
        // NOTE: Decide your policy for AppUser when deleting a student.
        // This keeps the current behavior (only delete Student).
        repo.deleteById(id);
    }
}
