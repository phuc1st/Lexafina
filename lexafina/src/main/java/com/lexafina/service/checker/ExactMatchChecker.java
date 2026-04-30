package com.lexafina.service.checker;

import com.lexafina.model.QuestionData;

public class ExactMatchChecker implements AnswerChecker {

    @Override
    public boolean check(String userAnswer, QuestionData question) {
        if (userAnswer == null || question.getCorrectAnswer() == null) return false;
        return userAnswer.trim().equalsIgnoreCase(question.getCorrectAnswer().trim());
    }
}
