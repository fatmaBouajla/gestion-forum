package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.UtilisateurRepository;
import com.enicarthage.forum.repository.WorkshopRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class WorkshopService {

    private final WorkshopRepository workshopRepository;
    private final ForumEditionGuard forumEditionGuard;
    private final UtilisateurRepository utilisateurRepository;

    // Tous les workshops (coordinatrice/admin)
    public List<Workshop> findAll() {
        return workshopRepository.findAll();
    }

    // Workshops du comité dont l'email est chef
    public List<Workshop> findByChef(String email) {
        return workshopRepository.findByComiteChefEmail(email);
    }

    // Proposer — enregistre aussi proposePar
    public Workshop proposer(Workshop workshop, String email) {
        if (workshop.getComite() == null || workshop.getComite().getId() == null) {
            throw new IllegalArgumentException("Comite organisateur obligatoire");
        }
        forumEditionGuard.assertForumOuvert(workshop.getComite().getId());
        workshop.setStatut(StatutWorkshop.PROPOSE);

        // Enregistrer qui a proposé
        utilisateurRepository.findByEmail(email).ifPresent(workshop::setProposePar);

        return workshopRepository.save(workshop);
    }

    public Workshop valider(Long id) {
        forumEditionGuard.assertWorkshopOuvert(id);
        Workshop w = workshopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workshop non trouve"));
        w.setStatut(StatutWorkshop.VALIDE);
        log.info("Workshop valide : {}", w.getTitre());
        return workshopRepository.save(w);
    }

    public Workshop refuser(Long id, String motif) {
        forumEditionGuard.assertWorkshopOuvert(id);
        Workshop w = workshopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workshop non trouve"));
        w.setStatut(StatutWorkshop.REFUSE);
        if (motif != null && !motif.isBlank()) {
            w.setMotifRefus(motif.trim());
        }
        log.info("Workshop refuse : {}", w.getTitre());
        return workshopRepository.save(w);
    }

    public Workshop findById(Long id) {
        return workshopRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workshop non trouve"));
    }
}