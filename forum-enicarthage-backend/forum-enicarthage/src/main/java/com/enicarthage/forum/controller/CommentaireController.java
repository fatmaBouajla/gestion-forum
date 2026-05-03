package com.enicarthage.forum.controller;

import com.enicarthage.forum.dto.CommentaireRequest;
import com.enicarthage.forum.model.Commentaire;
import com.enicarthage.forum.service.CommentaireService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/taches/{tacheId}/commentaires")
@RequiredArgsConstructor
public class CommentaireController {

    private final CommentaireService commentaireService;

    @GetMapping
    public List<Commentaire> lister(@PathVariable Long tacheId, Authentication auth) {
        return commentaireService.listerPourTache(tacheId, auth.getName());
    }

    @PostMapping
    public Commentaire ajouter(
            @PathVariable Long tacheId,
            @RequestBody CommentaireRequest body,
            Authentication auth) {
        return commentaireService.ajouter(tacheId, auth.getName(), body);
    }
}
