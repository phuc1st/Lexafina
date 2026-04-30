package com.lexafina.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MockTestSummary {

    private long id;
    private String title;
    private String thumbnail;

    @JsonProperty("book_code")
    private String bookCode;

    @JsonProperty("skill_id")
    private int skillId;

    private int status;

    @JsonProperty("has_guided_retry")
    private boolean hasGuidedRetry;
}
