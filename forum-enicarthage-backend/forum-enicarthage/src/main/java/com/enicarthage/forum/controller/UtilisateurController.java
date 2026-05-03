package com.enicarthage.forum.controller;

import org.springframework.security.core.Authentication;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.service.UtilisateurService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/utilisateurs")
@RequiredArgsConstructor
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Utilisateur> getMe(Authentication auth) {
        Utilisateur u = utilisateurService.findByEmail(auth.getName());
        return ResponseEntity.ok(u);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<Utilisateur> getAll() {
        return utilisateurService.findAll();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur getById(@PathVariable Long id) {
        return utilisateurService.findById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur creer(@RequestBody Utilisateur u) {
        return utilisateurService.creer(u);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur modifier(@PathVariable Long id, @RequestBody Utilisateur u) {
        return utilisateurService.modifier(id, u);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        utilisateurService.supprimer(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/activer")
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur activer(@PathVariable Long id, @RequestParam boolean actif) {
        return utilisateurService.activerCompte(id, actif);
    }

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public Utilisateur assignerRole(@PathVariable Long id, @RequestParam RoleEnum role) {
        return utilisateurService.assignerRole(id, role);
    }
}
