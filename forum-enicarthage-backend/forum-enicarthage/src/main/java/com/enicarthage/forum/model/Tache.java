package com.enicarthage.forum.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "taches")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Tache {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateDebut;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateFin;

    @Enumerated(EnumType.STRING)
    private PrioriteTache priorite;

    @Enumerated(EnumType.STRING)
    private StatutTache statut;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "comite_id")
    @JsonIgnoreProperties({"membres", "chef", "forumProject", "hibernateLazyInitializer"})
    private Comite comite;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "membre_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilisateur membre;

    // ← AJOUTER
    @OneToMany(mappedBy = "tache", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonIgnoreProperties({"tache", "hibernateLazyInitializer"})
    @Builder.Default
    private List<Commentaire> commentaires = new ArrayList<>();
}