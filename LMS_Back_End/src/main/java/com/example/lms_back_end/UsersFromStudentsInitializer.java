package com.example.lms_back_end;

import com.example.lms_back_end.entity.AppUser;
import com.example.lms_back_end.entity.Student;
import com.example.lms_back_end.entity.Instructor;
import com.example.lms_back_end.repository.AppUserRepository;
import com.example.lms_back_end.repository.StudentRepository;
import com.example.lms_back_end.repository.InstructorRepository;
import com.example.lms_back_end.security.Role;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"default","dev"}) // remove or change as needed
public class UsersFromStudentsInitializer implements CommandLineRunner {

    private final StudentRepository students;
    private final InstructorRepository instructors;
    private final AppUserRepository users;
    private final PasswordEncoder passwordEncoder;

    // Change these if you want different defaults
    private static final String DEFAULT_STUDENT_PASSWORD = "student123";
    private static final String DEFAULT_INSTRUCTOR_PASSWORD = "instructor123";

    // Admin seed (username is an email, since there is no separate admin table)
    private static final String ADMIN_EMAIL = "admin@example.com";
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";

    // Only seed these 15 students (ids 1..15) you provided
    private static final List<Long> TARGET_STUDENT_IDS = List.of(
            1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L, 9L, 10L, 11L, 12L, 13L, 14L, 15L
    );

    // Only seed these 8 instructors (ids 1..8) you provided
    private static final List<Long> TARGET_INSTRUCTOR_IDS = List.of(
            1L, 2L, 3L, 4L, 5L, 6L, 7L, 8L
    );

    @Override
    @Transactional
    public void run(String... args) {
        // ===== Students =====
        var targetStudents = students.findAllById(TARGET_STUDENT_IDS);

        if (targetStudents.isEmpty()) {
            log.warn("No matching students found for {}", TARGET_STUDENT_IDS);
        } else {
            String encoded = passwordEncoder.encode(DEFAULT_STUDENT_PASSWORD);

            for (Student s : targetStudents) {
                String email = safeTrim(s.getEmail());
                if (email == null || email.isBlank()) {
                    log.warn("Student id={} has no email; skipping user creation", s.getId());
                    continue;
                }

                // If a user with this username already exists, skip (but update missing student link)
                var existing = users.findByUsernameIgnoreCase(email);
                if (existing.isPresent()) {
                    var u = existing.get();
                    if (u.getStudentId() == null) {
                        u.setStudentId(s.getId());
                        users.save(u);
                        log.info("Updated user '{}' with studentId={}", u.getUsername(), s.getId());
                    } else {
                        log.info("User '{}' already present; skipping", email);
                    }
                } else {
                    AppUser newUser = AppUser.builder()
                            .username(email)
                            .password(encoded)
                            .role(Role.STUDENT)
                            .studentId(s.getId())
                            .instructorId(null)
                            .build();

                    users.save(newUser);
                    log.info("Created user '{}' for studentId={}", email, s.getId());
                }
            }

            log.info("Student -> user seeding complete");
        }

        // ===== Instructors =====
        var targetInstructors = instructors.findAllById(TARGET_INSTRUCTOR_IDS);

        if (targetInstructors.isEmpty()) {
            log.warn("No matching instructors found for {}", TARGET_INSTRUCTOR_IDS);
        } else {
            String encodedInstructor = passwordEncoder.encode(DEFAULT_INSTRUCTOR_PASSWORD);

            for (Instructor i : targetInstructors) {
                String email = safeTrim(i.getEmail());
                if (email == null || email.isBlank()) {
                    log.warn("Instructor id={} has no email; skipping user creation", i.getId());
                    continue;
                }

                var existing = users.findByUsernameIgnoreCase(email);
                if (existing.isPresent()) {
                    var u = existing.get();
                    if (u.getInstructorId() == null) {
                        u.setInstructorId(i.getId());
                        users.save(u);
                        log.info("Updated user '{}' with instructorId={}", u.getUsername(), i.getId());
                    } else {
                        log.info("User '{}' already present; skipping", email);
                    }
                } else {
                    AppUser newUser = AppUser.builder()
                            .username(email)
                            .password(encodedInstructor)
                            .role(Role.INSTRUCTOR)
                            .studentId(null)
                            .instructorId(i.getId())
                            .build();

                    users.save(newUser);
                    log.info("Created user '{}' for instructorId={}", email, i.getId());
                }
            }

            log.info("Instructor -> user seeding complete");
        }

        // ===== Admin =====
        String adminEmail = safeTrim(ADMIN_EMAIL);
        if (adminEmail == null || adminEmail.isBlank()) {
            log.warn("Admin email is blank; skipping admin creation");
        } else {
            var existingAdmin = users.findByUsernameIgnoreCase(adminEmail);
            if (existingAdmin.isPresent()) {
                var u = existingAdmin.get();
                if (u.getRole() != Role.ADMIN) {
                    log.warn("User '{}' already exists with role {}; not changing role to ADMIN", adminEmail, u.getRole());
                } else {
                    log.info("Admin '{}' already present; skipping", adminEmail);
                }
            } else {
                String encodedAdmin = passwordEncoder.encode(DEFAULT_ADMIN_PASSWORD);
                AppUser admin = AppUser.builder()
                        .username(adminEmail)
                        .password(encodedAdmin)
                        .role(Role.ADMIN)
                        .studentId(null)
                        .instructorId(null)
                        .build();
                users.save(admin);
                log.info("Created admin user '{}'", adminEmail);
            }
        }
    }

    private static String safeTrim(String v) { return v == null ? null : v.trim(); }
}
