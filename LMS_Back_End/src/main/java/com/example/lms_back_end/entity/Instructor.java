package com.example.lms_back_end.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
        name = "instructors",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_instructors_email", columnNames = "email"),
                @UniqueConstraint(name = "uk_instructors_staff_no", columnNames = "staff_no")
        }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Instructor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Official staff number */
    @NotBlank @Size(max = 20)
    @Column(name = "staff_no", nullable = false, length = 20)
    private String staffNo;

    @NotBlank @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String firstName;

    @NotBlank @Size(max = 60)
    @Column(nullable = false, length = 60)
    private String lastName;

    @NotBlank @Email @Size(max = 120)
    @Column(nullable = false, length = 120)
    private String email;

    @Size(max = 30)
    private String phone;

    /** Owning side of the many-to-many; Course class need not change */
    @ManyToMany
    @JoinTable(
            name = "course_instructors",
            joinColumns = @JoinColumn(name = "instructor_id"),
            inverseJoinColumns = @JoinColumn(name = "course_id"),
            uniqueConstraints = @UniqueConstraint(
                    name = "uk_course_instructors_pair",
                    columnNames = {"instructor_id", "course_id"}
            )
    )
    @Builder.Default
    private Set<Course> courses = new HashSet<>();
}