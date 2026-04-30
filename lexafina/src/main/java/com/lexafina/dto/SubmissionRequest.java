package com.lexafina.dto;

import lombok.Data;

import java.util.List;

@Data
public class SubmissionRequest {

    private long quizId;
    private List<UserAnswer> answers;

    @Data
    public static class UserAnswer {
        private long questionId;
        private String answer;
    }
}
