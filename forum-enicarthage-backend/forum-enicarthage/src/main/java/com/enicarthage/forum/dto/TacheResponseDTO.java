package com.enicarthage.forum.dto;

import com.enicarthage.forum.model.PrioriteTache;
import com.enicarthage.forum.model.StatutTache;
import lombok.Data;
import java.time.LocalDate;

@Data
public class TacheResponseDTO {
    private Long id;
    private String titre;
    private String description;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private PrioriteTache priorite;
    private StatutTache statut;
    private Long comiteId;
    private String comiteNom;   // ← clé
    private Long membreId;
    private String membreNom;   // ← clé
}