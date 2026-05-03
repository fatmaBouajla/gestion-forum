package com.enicarthage.forum.controller;

import com.enicarthage.forum.dto.TacheDTO;
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
    public List<Tache> lister(
            Authentication auth,
            @RequestParam(required = false) StatutTache statut) {
        return tacheService.listerPourUtilisateur(auth.getName(), statut);
    }

    @GetMapping("/mes-taches")
    public List<Tache> mesTaches(Authentication auth) {
        return tacheService.listerPourUtilisateur(auth.getName(), null);
    }

    @GetMapping("/{id}")
    public Tache getById(@PathVariable Long id) {
        return tacheService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_COMITE','COORDINATRICE')")
    public Tache creer(@RequestBody TacheDTO dto) {
        return tacheService.creer(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_COMITE','COORDINATRICE','COMITE_PILOTAGE')")
    public Tache modifier(@PathVariable Long id, @RequestBody TacheDTO dto, Authentication auth) {
        return tacheService.modifier(id, dto, auth.getName());
    }

    // ✅ MODIFIÉ ICI
    @PutMapping("/{id}/statut")
    public ResponseEntity<Void> changerStatut(
            @PathVariable Long id,
            @RequestParam StatutTache statut,
            Authentication auth) {
        tacheService.changerStatut(id, statut, auth.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        tacheService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}