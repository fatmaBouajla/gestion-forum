package com.enicarthage.forum.controller;

import com.enicarthage.forum.dto.TacheDTO;
import com.enicarthage.forum.dto.TacheResponseDTO;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.service.TacheService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/taches")
@RequiredArgsConstructor
public class TacheController {

    private final TacheService tacheService;

    @GetMapping
    public List<TacheResponseDTO> lister(
            Authentication auth,
            @RequestParam(required = false) StatutTache statut) {
        return tacheService.listerPourUtilisateur(auth.getName(), statut)
                .stream().map(tacheService::toDTO).toList();
    }

    @GetMapping("/mes-taches")
    public List<TacheResponseDTO> mesTaches(Authentication auth) {
        return tacheService.listerPourUtilisateur(auth.getName(), null)
                .stream().map(tacheService::toDTO).toList();
    }

    @GetMapping("/{id}")
    public TacheResponseDTO getById(@PathVariable Long id) {
        return tacheService.toDTO(tacheService.findById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_COMITE','COORDINATRICE')")
    public TacheResponseDTO creer(@RequestBody TacheDTO dto) {
        return tacheService.toDTO(tacheService.creer(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_COMITE','COORDINATRICE','COMITE_PILOTAGE')")
    public TacheResponseDTO modifier(
            @PathVariable Long id,
            @RequestBody TacheDTO dto,
            Authentication auth) {
        return tacheService.toDTO(tacheService.modifier(id, dto, auth.getName()));
    }

    @PutMapping("/{id}/statut")
    public ResponseEntity<?> changerStatut(
            @PathVariable Long id,
            @RequestParam StatutTache statut,
            Authentication auth) {
        try {
            tacheService.changerStatut(id, statut, auth.getName());
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(e.getMessage() + " | " + e.getClass().getName());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        tacheService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}