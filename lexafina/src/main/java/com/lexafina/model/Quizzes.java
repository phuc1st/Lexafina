package com.lexafina.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class Quizzes {

    private QuizRef full;

    @JsonProperty("part_1")
    private QuizRef part1;

    @JsonProperty("part_2")
    private QuizRef part2;

    @JsonProperty("part_3")
    private QuizRef part3;

    @JsonProperty("part_4")
    private QuizRef part4;
}
