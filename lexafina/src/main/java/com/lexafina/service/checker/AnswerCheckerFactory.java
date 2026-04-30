package com.lexafina.service.checker;

import com.lexafina.model.QuestionType;

import java.util.EnumMap;
import java.util.Map;

public final class AnswerCheckerFactory {

    private static final Map<QuestionType.Category, AnswerChecker> CHECKERS = new EnumMap<>(QuestionType.Category.class);

    static {
        CHECKERS.put(QuestionType.Category.EXACT_MATCH, new ExactMatchChecker());
        CHECKERS.put(QuestionType.Category.TEXT, new TextChecker());
        CHECKERS.put(QuestionType.Category.MULTI_ANSWER, new MultiAnswerChecker());
    }

    private AnswerCheckerFactory() {}

    public static AnswerChecker getChecker(QuestionType type) {
        return CHECKERS.getOrDefault(type.category(), CHECKERS.get(QuestionType.Category.EXACT_MATCH));
    }
}
