package com.lexafina.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Phản hồi tối thiểu khi server đã nhận bài (chưa chấm điểm).
 */
@Data
@AllArgsConstructor
public class WritingSubmissionAck {
    private long quizId;
    private boolean received;
}
