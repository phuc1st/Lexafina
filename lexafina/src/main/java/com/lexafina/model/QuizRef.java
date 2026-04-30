package com.lexafina.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class QuizRef {

    private long id;
    private int type;

    @JsonProperty("mock_test_type")
    private int mockTestType;

    private int time;

    @JsonProperty("question_count")
    private int questionCount;

    private String slug;

    @JsonProperty("meta_seo_id")
    private Integer metaSeoId;

    @JsonProperty("meta_seo")
    private Object metaSeo;
}
