package com.enicarthage.forum.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workshops")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Workshop {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String intervenant;

    private LocalDateTime dateHeure;

    @Enumerated(EnumType.STRING)
    private StatutWorkshop statut;

    @Column(columnDefinition = "TEXT")
    private String motifRefus;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "comite_id")
    @JsonIgnoreProperties({"membres", "forumProject", "hibernateLazyInitializer", "handler"})
    private Comite comite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "propose_par_id")
    @JsonIgnoreProperties({"motDePasse", "hibernateLazyInitializer", "handler"})
    private Utilisateur proposePar;
}