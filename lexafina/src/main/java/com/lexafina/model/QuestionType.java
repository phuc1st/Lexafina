package com.lexafina.model;

public enum QuestionType {

    TRUE_FALSE,
    YES_NO,
    MULTIPLE_CHOICE_ONE,
    MULTIPLE_CHOICE_MANY,
    MATCHING_INFO,
    MATCHING_FEATURES,
    MATCHING_ENDINGS,
    SUMMARY_COMPLETION,
    GAP_FILLING,
    SINGLE_SELECTION,
    SINGLE_CHOICE,
    TABLE_SELECTION,
    UNKNOWN;

    public static QuestionType fromString(String raw) {
        if (raw == null || raw.isBlank()) return UNKNOWN;
        try {
            return QuestionType.valueOf(raw.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return UNKNOWN;
        }
    }

    public Category category() {
        return switch (this) {
            case MULTIPLE_CHOICE_MANY -> Category.MULTI_ANSWER;
            case SUMMARY_COMPLETION, GAP_FILLING -> Category.TEXT;
            default -> Category.EXACT_MATCH;
        };
    }

    public enum Category {
        EXACT_MATCH,
        TEXT,
        MULTI_ANSWER
    }
}
