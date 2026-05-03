package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class ComiteService {

    private final ComiteRepository comiteRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ForumProjectRepository forumProjectRepository;
    private final ForumEditionGuard forumEditionGuard;

    public Comite creer(Comite comite) {
        // Résoudre forumProject
        if (comite.getForumProject() != null && comite.getForumProject().getId() != null) {
            ForumProject fp = forumProjectRepository.findById(comite.getForumProject().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Forum introuvable"));
            forumEditionGuard.assertForumOuvert(fp);
            comite.setForumProject(fp);
        }

        // Résoudre chef — nullable
        if (comite.getChef() != null && comite.getChef().getId() != null) {
            Utilisateur chef = utilisateurRepository.findById(comite.getChef().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chef introuvable"));
            comite.setChef(chef);
        } else {
            comite.setChef(null);  // ← explicitement null
        }

        Comite saved = comiteRepository.save(comite);
        log.info("Comite creé : {}", saved.getNom());
        return saved;
    }

    public Comite modifier(Long id, Comite data) {
        Comite comite = findById(id);

        if (data.getNom() != null) comite.setNom(data.getNom());
        if (data.getDescription() != null) comite.setDescription(data.getDescription());

        if (data.getForumProject() != null && data.getForumProject().getId() != null) {
            ForumProject fp = forumProjectRepository.findById(data.getForumProject().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Forum introuvable"));
            comite.setForumProject(fp);
        }

        if (data.getChef() != null && data.getChef().getId() != null) {
            Utilisateur chef = utilisateurRepository.findById(data.getChef().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Chef introuvable"));
            comite.setChef(chef);
        } else {
            comite.setChef(null);
        }

        return comiteRepository.save(comite);
    }

    public Comite findById(Long id) {
        return comiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comite non trouve : " + id));
    }

    public List<Comite> findAll() {
        return comiteRepository.findAll();
    }

    public List<Comite> findByForumProject(Long forumProjectId) {
        return comiteRepository.findByForumProjectId(forumProjectId);
    }

    public Comite findByChefEmail(String email) {
        Utilisateur chef = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve : " + email));
        return comiteRepository.findByChefId(chef.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Aucun comite assigne a ce chef"));
    }

    public Comite ajouterMembre(Long comiteId, Long utilisateurId, String actorEmail) {
        Comite comite = findById(comiteId);
        Utilisateur actor = utilisateurRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        forumEditionGuard.assertForumOuvert(comiteId);
        if (actor.getRole() == RoleEnum.CHEF_COMITE) {
            if (comite.getChef() == null || !comite.getChef().getId().equals(actor.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reserve au chef de ce comite");
            }
        } else if (actor.getRole() != RoleEnum.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Action reservee a l'administration");
        }
        Utilisateur u = utilisateurRepository.findById(utilisateurId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve"));
        if (!comite.getMembres().contains(u)) {
            comite.getMembres().add(u);
            log.info("Membre {} ajoute au comite {}", u.getEmail(), comite.getNom());
        }
        return comiteRepository.save(comite);
    }

    public Comite retirerMembre(Long comiteId, Long utilisateurId, String actorEmail) {
        Comite comite = findById(comiteId);
        Utilisateur actor = utilisateurRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        forumEditionGuard.assertForumOuvert(comiteId);
        if (actor.getRole() == RoleEnum.CHEF_COMITE) {
            if (comite.getChef() == null || !comite.getChef().getId().equals(actor.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Reserve au chef de ce comite");
            }
        } else if (actor.getRole() != RoleEnum.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Action reservee a l'administration");
        }
        comite.getMembres().removeIf(m -> m.getId().equals(utilisateurId));
        log.info("Membre {} retire du comite {}", utilisateurId, comite.getNom());
        return comiteRepository.save(comite);
    }

    public void supprimer(Long id) {
        comiteRepository.deleteById(id);
    }
}