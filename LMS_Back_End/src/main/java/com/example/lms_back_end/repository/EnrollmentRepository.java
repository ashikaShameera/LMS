package com.example.lms_back_end.repository;

import com.example.lms_back_end.entity.Enrollment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    boolean existsByStudent_IdAndCourse_IdAndActive(Long studentId, Long courseId, boolean active);
    Optional<Enrollment> findByStudent_IdAndCourse_IdAndActive(Long studentId, Long courseId, boolean active);
    long countByCourse_IdAndActive(Long courseId, boolean active);

    Page<Enrollment> findByStudent_IdAndActive(Long studentId, boolean active, Pageable pageable);
    Page<Enrollment> findByCourse_IdAndActive(Long courseId, boolean active, Pageable pageable);
}
