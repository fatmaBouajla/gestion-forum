package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.ComiteRepository;
import com.enicarthage.forum.repository.TacheRepository;
import com.enicarthage.forum.repository.WorkshopRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Component
@RequiredArgsConstructor
public class ForumEditionGuard {

    private final ComiteRepository comiteRepository;
    private final TacheRepository tacheRepository;
    private final WorkshopRepository workshopRepository;

    @Transactional(readOnly = true)
    public void assertForumOuvert(Long comiteId) {
        Comite c = comiteRepository.findById(comiteId)
                .orElseThrow(() -> new ResourceNotFoundException("Comite introuvable : " + comiteId));
        assertForumOuvert(c.getForumProject());
    }

    public void assertForumOuvert(ForumProject fp) {
        if (fp == null) {
            return;
        }
        if (fp.getStatut() == StatutProjet.CLOTURE) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Projet Forum clos : modifications interdites (consultation uniquement).");
        }
    }

    @Transactional(readOnly = true)
    public void assertTacheOuverte(Long tacheId) {
        Tache t = tacheRepository.findById(tacheId)
                .orElseThrow(() -> new ResourceNotFoundException("Tache introuvable : " + tacheId));
        assertForumOuvert(t.getComite().getForumProject());
    }

    @Transactional(readOnly = true)
    public void assertWorkshopOuvert(Long workshopId) {
        Workshop w = workshopRepository.findById(workshopId)
                .orElseThrow(() -> new ResourceNotFoundException("Workshop introuvable : " + workshopId));
        assertForumOuvert(w.getComite().getForumProject());
    }
}
