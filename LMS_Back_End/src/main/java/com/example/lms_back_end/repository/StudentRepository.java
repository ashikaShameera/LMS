package com.example.lms_back_end.repository;


import com.example.lms_back_end.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentRepository extends JpaRepository<Student, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByStudentNoIgnoreCase(String studentNo);

    Page<Student> findByStudentNoContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String studentNo, String firstName, String lastName, String email, Pageable pageable);
}