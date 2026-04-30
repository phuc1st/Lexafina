package com.lexafina.service.checker;

import com.lexafina.model.QuestionData;

import java.util.List;

public class TextChecker implements AnswerChecker {

    @Override
    public boolean check(String userAnswer, QuestionData question) {
        if (userAnswer == null) return false;

        String normalized = normalize(userAnswer);

        List<String> acceptedAnswers = question.getCorrectAnswers();
        if (acceptedAnswers != null && !acceptedAnswers.isEmpty()) {
            return acceptedAnswers.stream()
                    .anyMatch(a -> normalize(a).equals(normalized));
        }

        String single = question.getCorrectAnswer();
        if (single != null && !single.isBlank()) {
            return normalize(single).equals(normalized);
        }

        return false;
    }

    private String normalize(String s) {
        return s.toLowerCase().trim().replaceAll("\\s+", " ");
    }
}
