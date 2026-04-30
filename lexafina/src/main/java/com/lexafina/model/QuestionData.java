package com.lexafina.model;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class QuestionData {

    private long id;
    private int order;
    private QuestionType questionType;
    private String correctAnswer;
    private List<String> correctAnswers;
    private long quizId;
}
