package com.lexafina.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class PagedResponse<T> {

    private int total;
    private int page;

    @JsonProperty("page_size")
    private int pageSize;

    private List<T> items;
}
