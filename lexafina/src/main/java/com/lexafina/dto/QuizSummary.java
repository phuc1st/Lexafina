package com.lexafina.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class QuizSummary {

    private long id;

    private int part;

    @JsonProperty("skill_id")
    private int skillId;

    private String title;

    private int time;

    @JsonProperty("question_count")
    private int questionCount;

    @JsonProperty("task_type")
    private Integer taskType;

    private String slug;

    @JsonProperty("mock_test_id")
    private long mockTestId;

    @JsonProperty("mock_test_title")
    private String mockTestTitle;

    @JsonProperty("book_title")
    private String bookTitle;

    private String thumbnail;
}
