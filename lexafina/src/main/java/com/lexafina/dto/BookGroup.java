package com.lexafina.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class BookGroup {

    private String title;

    @JsonProperty("mock_tests")
    private List<MockTestSummary> mockTests;

    private int total;
}
