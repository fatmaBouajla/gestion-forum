package com.enicarthage.forum.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.*;
import java.time.LocalDateTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidatureCVDto {
    private Long id;
    private String fichierCV;
    private String posteVise;
    private Double scoreIA;
    private String justificationIA;
    private String competencesExtraites;
    private String statut;
    private String commentaire;
    private String dossierComplet;
    private String candidatNom;
    private String candidatEmail;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateDepot;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateAnalyseIA;
}