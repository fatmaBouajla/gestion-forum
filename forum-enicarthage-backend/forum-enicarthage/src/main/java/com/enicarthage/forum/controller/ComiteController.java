package com.enicarthage.forum.controller;

import com.enicarthage.forum.model.Comite;
import com.enicarthage.forum.service.ComiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comites")
@RequiredArgsConstructor
public class ComiteController {

    private final ComiteService comiteService;

    @GetMapping
    public List<Comite> getAll() {
        return comiteService.findAll();
    }

    @GetMapping("/{id}")
    public Comite getById(@PathVariable Long id) {
        return comiteService.findById(id);
    }

    @GetMapping("/forum/{forumId}")
    public List<Comite> getByForum(@PathVariable Long forumId) {
        return comiteService.findByForumProject(forumId);
    }

    @GetMapping("/mon-comite")
    @PreAuthorize("hasRole('CHEF_COMITE')")
    public ResponseEntity<Comite> getMonComite(Authentication auth) {
        Comite comite = comiteService.findByChefEmail(auth.getName());
        return ResponseEntity.ok(comite);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Comite creer(@RequestBody Comite comite) {
        return comiteService.creer(comite);
    }

    @PostMapping("/{id}/membres")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_COMITE')")
    public Comite ajouterMembre(
            @PathVariable Long id,
            @RequestParam Long utilisateurId,
            Authentication auth) {
        return comiteService.ajouterMembre(id, utilisateurId, auth.getName());
    }

    @DeleteMapping("/{id}/membres")
    @PreAuthorize("hasAnyRole('ADMIN','CHEF_COMITE')")
    public Comite retirerMembre(
            @PathVariable Long id,
            @RequestParam Long utilisateurId,
            Authentication auth) {
        return comiteService.retirerMembre(id, utilisateurId, auth.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        comiteService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
