package com.lexafina.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class MockTest {

    private long id;
    private String title;
    private String thumbnail;

    @JsonProperty("book_code")
    private String bookCode;

    @JsonProperty("skill_id")
    private int skillId;

    private Quizzes quizzes;
    private int status;

    @JsonProperty("has_guided_retry")
    private boolean hasGuidedRetry;

    @JsonIgnore
    private String bookTitle;
}
