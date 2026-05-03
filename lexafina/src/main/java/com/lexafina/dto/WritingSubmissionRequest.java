package com.lexafina.dto;

import lombok.Data;

/**
 * Payload gửi từ UI khi hoàn thành bài Writing (4 khối + metadata tùy chọn).
 */
@Data
public class WritingSubmissionRequest {

    private long quizId;
    private String introduction;
    private String overview;
    private String body1;
    private String body2;
    /** Tổng từ do client tính; optional. */
    private Integer wordCount;
}
