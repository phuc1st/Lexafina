package com.lexafina.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SubmissionResult {

    @JsonProperty("quiz_id")
    private long quizId;

    @JsonProperty("total_questions")
    private int totalQuestions;

    @JsonProperty("correct_count")
    private int correctCount;

    private double score;

    private List<QuestionResult> details;

    @Data
    @Builder
    public static class QuestionResult {

        @JsonProperty("question_id")
        private long questionId;

        private int order;

        @JsonProperty("question_type")
        private String questionType;

        @JsonProperty("user_answer")
        private String userAnswer;

        @JsonProperty("correct_answer")
        private String correctAnswer;

        @JsonProperty("is_correct")
        private boolean isCorrect;
    }
}
