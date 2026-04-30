package com.lexafina.service.checker;

import com.lexafina.model.QuestionData;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class MultiAnswerChecker implements AnswerChecker {

    @Override
    public boolean check(String userAnswer, QuestionData question) {
        if (userAnswer == null) return false;

        List<String> correctList = question.getCorrectAnswers();
        if (correctList == null || correctList.isEmpty()) return false;

        Set<String> expected = correctList.stream()
                .map(s -> s.trim().toUpperCase())
                .collect(Collectors.toSet());

        Set<String> actual = Arrays.stream(userAnswer.split("[,;\\s]+"))
                .map(s -> s.trim().toUpperCase())
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        return expected.equals(actual);
    }
}
