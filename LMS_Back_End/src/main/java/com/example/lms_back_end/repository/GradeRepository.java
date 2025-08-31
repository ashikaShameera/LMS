package com.example.lms_back_end.repository;

import com.example.lms_back_end.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByEnrollment_Student_IdAndEnrollment_Course_Id(Long studentId, Long courseId);
    List<Grade> findByEnrollment_Student_Id(Long studentId);
}
