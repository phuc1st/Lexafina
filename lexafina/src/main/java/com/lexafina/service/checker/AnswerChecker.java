package com.lexafina.service.checker;

import com.lexafina.model.QuestionData;

public interface AnswerChecker {

    boolean check(String userAnswer, QuestionData question);
}
