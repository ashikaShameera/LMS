package com.example.lms_back_end.repository;


import com.example.lms_back_end.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CourseRepository extends JpaRepository<Course, Long> {
    boolean existsByCodeIgnoreCase(String code);
    Optional<Course> findByCodeIgnoreCase(String code);
    Page<Course> findByCodeContainingIgnoreCaseOrTitleContainingIgnoreCase(String code, String title, Pageable pageable);
}