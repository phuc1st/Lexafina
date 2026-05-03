package com.lexafina.service;

import com.lexafina.dto.WritingSubmissionAck;
import com.lexafina.dto.WritingSubmissionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * Tiếp nhận bài Writing từ client. Hiện chỉ xác thực quiz tồn tại, chưa lưu DB / chấm.
 */
@Service
@RequiredArgsConstructor
public class WritingSubmissionService {

    private final MockTestService mockTestService;

    public Optional<WritingSubmissionAck> accept(WritingSubmissionRequest request) {
        if (request.getQuizId() <= 0) {
            throw new IllegalArgumentException("quizId must be positive");
        }
        return mockTestService.getQuizById(request.getQuizId())
                .map(q -> new WritingSubmissionAck(request.getQuizId(), true));
    }
}
