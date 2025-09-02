package com.example.lms_back_end.security;


import com.example.lms_back_end.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service @RequiredArgsConstructor
public class CurrentUserDetailsService implements UserDetailsService {
    private final AppUserRepository repo;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var u = repo.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return CurrentUser.builder()
                .id(u.getId()).username(u.getUsername()).password(u.getPassword())
                .role(u.getRole()).studentId(u.getStudentId()).instructorId(u.getInstructorId())
                .build();
    }
}
