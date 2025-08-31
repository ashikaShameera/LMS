package com.example.lms_back_end.service;

import com.example.lms_back_end.dto.grade.*;
import org.springframework.data.domain.Page;

public interface GradeService {
    GradeDto upsert(GradeUpsertRequest req); // create or update
    Page<GradeDto> listByStudent(Long studentId, int page, int size);
    Page<GradeDto> listByCourse(Long courseId, int page, int size);
    GradeSummaryDto summaryByStudent(Long studentId);
}
