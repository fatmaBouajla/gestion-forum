package com.enicarthage.forum.service;

import com.enicarthage.forum.dto.CommentaireRequest;
import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.CommentaireRepository;
import com.enicarthage.forum.repository.TacheRepository;
import com.enicarthage.forum.repository.UtilisateurRepository;
import com.enicarthage.forum.security.TacheAuthorizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class CommentaireService {

    private final CommentaireRepository commentaireRepository;
    private final TacheRepository tacheRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ForumEditionGuard forumEditionGuard;
    private final TacheAuthorizationHelper tacheAuthorizationHelper;

    public List<Commentaire> listerPourTache(Long tacheId, String email) {
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable : " + tacheId));
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (!tacheAuthorizationHelper.peutAccederTache(u, tache)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acces refuse a cette tache");
        }
        return commentaireRepository.findByTacheId(tacheId);
    }

    public Commentaire ajouter(Long tacheId, String email, CommentaireRequest req) {
        if (req.getContenu() == null || req.getContenu().isBlank()) {
            throw new IllegalArgumentException("Contenu requis");
        }
        Tache tache = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable : " + tacheId));
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (!tacheAuthorizationHelper.peutAccederTache(u, tache)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acces refuse a cette tache");
        }
        forumEditionGuard.assertTacheOuverte(tacheId);
        Commentaire c = Commentaire.builder()
                .contenu(req.getContenu().trim())
                .dateCreation(LocalDateTime.now())
                .auteur(u)
                .tache(tache)
                .build();
        return commentaireRepository.save(c);
    }
}
