package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.ForumProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;

@Service @Transactional @Log4j2 @RequiredArgsConstructor
public class ForumProjectService {

    private final ForumProjectRepository forumProjectRepository;

    public ForumProject creer(ForumProject fp) {
        fp.setStatut(StatutProjet.PLANIFICATION);
        log.info("Creation du Forum : {}", fp.getNom());
        return forumProjectRepository.save(fp);
    }

    public ForumProject findById(Long id) {
        return forumProjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ForumProject non trouve : " + id));
    }

    public List<ForumProject> findAll() { return forumProjectRepository.findAll(); }

    /** Dernière édition non clôturée (planification ou en cours), la plus récente par date d'événement. */
    public Optional<ForumProject> findEditionCourante() {
        List<ForumProject> list = forumProjectRepository.findByStatutIn(
                List.of(StatutProjet.PLANIFICATION, StatutProjet.EN_COURS),
                Sort.by(Sort.Direction.DESC, "dateEvenement"));
        return list.isEmpty() ? Optional.empty() : Optional.of(list.get(0));
    }

    public ForumProject modifier(Long id, ForumProject data) {
        ForumProject fp = findById(id);
        fp.setNom(data.getNom());
        fp.setEdition(data.getEdition());
        fp.setDateDebut(data.getDateDebut());
        fp.setDateEvenement(data.getDateEvenement());
        fp.setLieu(data.getLieu());
        fp.setDescription(data.getDescription());
        fp.setStatut(data.getStatut());
        return forumProjectRepository.save(fp);
    }

    public ForumProject archiver(Long id) {
        ForumProject fp = findById(id);
        fp.setStatut(StatutProjet.CLOTURE);
        log.info("ForumProject archive : {}", fp.getNom());
        return forumProjectRepository.save(fp);
    }

    public List<ForumProject> getHistorique() {
        return forumProjectRepository.findByStatut(StatutProjet.CLOTURE);
    }

    public void supprimer(Long id) { forumProjectRepository.deleteById(id); }
}