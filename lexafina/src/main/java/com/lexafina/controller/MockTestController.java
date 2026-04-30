package com.lexafina.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.lexafina.dto.*;
import com.lexafina.model.MockTest;
import com.lexafina.service.MockTestService;
import com.lexafina.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MockTestController {

    private final MockTestService service;
    private final SubmissionService submissionService;

    @GetMapping("/mock-tests")
    public ResponseEntity<ApiResponse<PagedResponse<BookGroup>>> listMockTests(
            @RequestParam(defaultValue = "reading") String skill,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "desc") String sort) {

        PagedResponse<BookGroup> result = service.listMockTests(skill, page, pageSize, sort);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/mock-tests/{testId}")
    public ResponseEntity<ApiResponse<?>> getMockTest(@PathVariable long testId) {
        return service.getMockTestById(testId)
                .<ResponseEntity<ApiResponse<?>>>map(mt -> ResponseEntity.ok(ApiResponse.ok(mt)))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(ApiResponse.notFound("Mock test not found: " + testId)));
    }

    @GetMapping("/quizzes")
    public ResponseEntity<ApiResponse<PagedResponse<QuizSummary>>> listQuizzes(
            @RequestParam(defaultValue = "reading") String skill,
            @RequestParam(required = false) Integer part,
            @RequestParam(name = "task_type", required = false) Integer taskType,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(name = "page_size", defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "desc") String sort) {

        PagedResponse<QuizSummary> result = service.listQuizzes(skill, part, taskType, page, pageSize, sort);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    @GetMapping("/quizzes/{quizId}")
    public ResponseEntity<ApiResponse<?>> getQuiz(@PathVariable long quizId) {
        return service.getQuizById(quizId)
                .<ResponseEntity<ApiResponse<?>>>map(q -> ResponseEntity.ok(ApiResponse.ok(q)))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(ApiResponse.notFound("Quiz not found: " + quizId)));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.badRequest(ex.getMessage()));
    }

    @PostMapping("/submissions")
    public ResponseEntity<ApiResponse<?>> submitAnswers(@RequestBody SubmissionRequest request) {
        return submissionService.evaluate(request)
                .<ResponseEntity<ApiResponse<?>>>map(r -> ResponseEntity.ok(ApiResponse.ok(r)))
                .orElseGet(() -> ResponseEntity.status(404)
                        .body(ApiResponse.notFound("Quiz not found: " + request.getQuizId())));
    }
}
