package com.enicarthage.forum.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "candidatures_cv")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CandidatureCV {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fichierCV;
    private String posteVise;
    private Double scoreIA;

    @Column(columnDefinition = "TEXT")
    private String justificationIA;

    @Column(columnDefinition = "TEXT")
    private String competencesExtraites;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateAnalyseIA;

    @Enumerated(EnumType.STRING)
    private StatutCandidature statut;

    private String commentaire;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateDepot;

    @Column(columnDefinition = "TEXT")
    private String dossierComplet;

    private String candidatNom;
    private String candidatEmail;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "candidat_id", nullable = true)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilisateur candidat;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "forum_project_id")
    @JsonIgnoreProperties({"comites", "hibernateLazyInitializer"})
    private ForumProject forumProject;
}