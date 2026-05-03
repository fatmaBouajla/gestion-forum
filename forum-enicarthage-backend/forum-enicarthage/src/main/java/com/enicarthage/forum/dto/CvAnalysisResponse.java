package com.enicarthage.forum.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/** Réponse JSON du microservice Python /analyze */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CvAnalysisResponse {
    private double score;
    private String justification;
    private List<String> competences = new ArrayList<>();
}
