package com.example.lms_back_end.dto.grade;


import com.example.lms_back_end.entity.Grade;

public final class GradeMapper {
    private GradeMapper() {}

    public static GradeDto toDto(Grade g) {
        var e = g.getEnrollment();
        var c = e.getCourse();
        var dto = GradeDto.builder()
                .id(g.getId())
                .studentId(e.getStudent().getId())
                .courseId(c.getId())
                .courseCode(c.getCode())
                .courseTitle(c.getTitle())
                .score(g.getScore())
                .build();
        dto.setGradePoint(gradePoint(g.getScore()));
        dto.setLetter(letter(g.getScore()));
        return dto;
    }

    /** Simple 4.0 mapping; tune as you like */
    public static double gradePoint(int s) {
        if (s >= 90) return 4.0;
        if (s >= 85) return 3.7;
        if (s >= 80) return 3.3;
        if (s >= 75) return 3.0;
        if (s >= 70) return 2.7;
        if (s >= 65) return 2.3;
        if (s >= 60) return 2.0;
        if (s >= 55) return 1.7;
        if (s >= 50) return 1.0;
        return 0.0;
    }
    public static String letter(int s) {
        if (s >= 90) return "A";
        if (s >= 85) return "A-";
        if (s >= 80) return "B+";
        if (s >= 75) return "B";
        if (s >= 70) return "B-";
        if (s >= 65) return "C+";
        if (s >= 60) return "C";
        if (s >= 55) return "C-";
        if (s >= 50) return "D";
        return "F";
    }
}