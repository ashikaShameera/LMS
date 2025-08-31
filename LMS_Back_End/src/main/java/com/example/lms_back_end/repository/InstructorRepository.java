package com.example.lms_back_end.repository;

import com.example.lms_back_end.entity.Instructor;
import com.example.lms_back_end.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface InstructorRepository extends JpaRepository<Instructor, Long> {
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByStaffNoIgnoreCase(String staffNo);
    boolean existsByIdAndCourses_Id(Long instructorId, Long courseId);

    Page<Instructor> findByStaffNoContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
            String staffNo, String firstName, String lastName, String email, Pageable pageable);

    @Query("""
           select c from Instructor i
           join i.courses c
           where i.id = :instructorId
           """)
    Page<Course> findCoursesByInstructorId(Long instructorId, Pageable pageable);
}