package com.lexafina.service;

import com.lexafina.dto.SubmissionRequest;
import com.lexafina.dto.SubmissionResult;
import com.lexafina.loader.DataLoader;
import com.lexafina.model.QuestionData;
import com.lexafina.service.checker.AnswerChecker;
import com.lexafina.service.checker.AnswerCheckerFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionService {

    private final DataLoader dataLoader;

    public Optional<SubmissionResult> evaluate(SubmissionRequest request) {
        long quizId = request.getQuizId();
        List<QuestionData> quizQuestions = dataLoader.getQuizQuestionsMap().get(quizId);
        if (quizQuestions == null || quizQuestions.isEmpty()) {
            return Optional.empty();
        }

        Map<Long, String> userAnswerMap = request.getAnswers().stream()
                .collect(Collectors.toMap(
                        SubmissionRequest.UserAnswer::getQuestionId,
                        SubmissionRequest.UserAnswer::getAnswer,
                        (a, b) -> b
                ));

        List<SubmissionResult.QuestionResult> details = new ArrayList<>();
        int correctCount = 0;

        for (QuestionData qd : quizQuestions) {
            String userAnswer = userAnswerMap.get(qd.getId());
            AnswerChecker checker = AnswerCheckerFactory.getChecker(qd.getQuestionType());
            boolean isCorrect = userAnswer != null && checker.check(userAnswer, qd);

            if (isCorrect) correctCount++;

            String displayCorrect = formatCorrectAnswer(qd);

            details.add(SubmissionResult.QuestionResult.builder()
                    .questionId(qd.getId())
                    .order(qd.getOrder())
                    .questionType(qd.getQuestionType().name())
                    .userAnswer(userAnswer != null ? userAnswer : "")
                    .correctAnswer(displayCorrect)
                    .isCorrect(isCorrect)
                    .build());
        }

        int total = quizQuestions.size();
        double score = total > 0 ? Math.round((double) correctCount / total * 100.0 * 10.0) / 10.0 : 0;

        return Optional.of(SubmissionResult.builder()
                .quizId(quizId)
                .totalQuestions(total)
                .correctCount(correctCount)
                .score(score)
                .details(details)
                .build());
    }

    private String formatCorrectAnswer(QuestionData qd) {
        if (qd.getCorrectAnswers() != null && !qd.getCorrectAnswers().isEmpty()) {
            return String.join(", ", qd.getCorrectAnswers());
        }
        return qd.getCorrectAnswer() != null ? qd.getCorrectAnswer() : "";
    }
}
