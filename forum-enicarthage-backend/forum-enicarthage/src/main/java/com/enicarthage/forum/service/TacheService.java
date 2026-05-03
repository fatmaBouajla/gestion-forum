package com.enicarthage.forum.service;

import com.enicarthage.forum.dto.TacheDTO;
import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.*;
import com.enicarthage.forum.security.TacheAuthorizationHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class TacheService {

    private final TacheRepository tacheRepository;
    private final ComiteRepository comiteRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final NotificationService notificationService;
    private final ForumEditionGuard forumEditionGuard;
    private final TacheAuthorizationHelper tacheAuthorizationHelper;

    public boolean peutAccederTache(Utilisateur u, Tache t) {
        return tacheAuthorizationHelper.peutAccederTache(u, t);
    }

    public Tache creer(TacheDTO dto) {
        Comite comite = comiteRepository.findById(dto.getComiteId())
                .orElseThrow(() -> new ResourceNotFoundException("Comite non trouve"));
        forumEditionGuard.assertForumOuvert(comite.getId());
        Tache tache = Tache.builder()
                .titre(dto.getTitre())
                .description(dto.getDescription())
                .dateDebut(dto.getDateDebut())
                .dateFin(dto.getDateFin())
                .priorite(dto.getPriorite())
                .statut(StatutTache.A_FAIRE)
                .comite(comite)
                .build();
        if (dto.getMembreId() != null) {
            Utilisateur membre = utilisateurRepository.findById(dto.getMembreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Membre non trouve"));
            tache.setMembre(membre);
        }
        Tache saved = tacheRepository.save(tache);
        if (saved.getMembre() != null) {
            notificationService.envoyer(
                    "Nouvelle tache assignee : " + saved.getTitre(),
                    saved.getMembre(),
                    TypeNotification.TACHE_ASSIGNEE,
                    saved);
        }
        return saved;
    }

    public Tache modifier(Long id, TacheDTO dto, String actorEmail) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tache non trouvee"));
        Utilisateur actor = utilisateurRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (!tacheAuthorizationHelper.peutGererTacheEtendu(actor, tache)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Modification non autorisee");
        }
        forumEditionGuard.assertTacheOuverte(id);
        if (dto.getTitre() != null) tache.setTitre(dto.getTitre());
        if (dto.getDescription() != null) tache.setDescription(dto.getDescription());
        if (dto.getDateDebut() != null) tache.setDateDebut(dto.getDateDebut());
        if (dto.getDateFin() != null) tache.setDateFin(dto.getDateFin());
        if (dto.getPriorite() != null) tache.setPriorite(dto.getPriorite());
        if (dto.getStatut() != null) tache.setStatut(dto.getStatut());
        if (dto.getComiteId() != null && !dto.getComiteId().equals(tache.getComite().getId())) {
            Comite nouveau = comiteRepository.findById(dto.getComiteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Comite non trouve"));
            forumEditionGuard.assertForumOuvert(nouveau.getId());
            tache.setComite(nouveau);
        }
        if (dto.getMembreId() != null) {
            Utilisateur membre = utilisateurRepository.findById(dto.getMembreId())
                    .orElseThrow(() -> new ResourceNotFoundException("Membre non trouve"));
            boolean changed = tache.getMembre() == null
                    || !tache.getMembre().getId().equals(membre.getId());
            tache.setMembre(membre);
            if (changed) {
                notificationService.envoyer(
                        "Tache assignee : " + tache.getTitre(),
                        membre,
                        TypeNotification.TACHE_ASSIGNEE,
                        tache);
            }
        }
        return tacheRepository.save(tache);
    }

    public Tache changerStatut(Long id, StatutTache statut, String actorEmail) {
        Tache tache = tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tache non trouvee"));
        Utilisateur actor = utilisateurRepository.findByEmail(actorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        if (!tacheAuthorizationHelper.peutAccederTache(actor, tache)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Changement de statut refuse");
        }
        forumEditionGuard.assertTacheOuverte(id);

        // ← UPDATE direct sans sérialisation de l'entité complète
        tacheRepository.updateStatut(id, statut);
        tache.setStatut(statut);
        return tache;
    }

    public List<Tache> listerPourUtilisateur(String email, StatutTache filtreStatut) {
        Utilisateur u = utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        List<Tache> list = switch (u.getRole()) {
            case ADMIN, COMITE_PILOTAGE, COORDINATRICE -> tacheRepository.findAll();
            case CHEF_COMITE -> comiteRepository.findByChefId(u.getId())
                    .map(c -> tacheRepository.findByComiteId(c.getId()))
                    .orElse(List.of());
            case MEMBRE -> tacheRepository.findByMembreId(u.getId());
        };
        if (filtreStatut != null) {
            return list.stream().filter(t -> t.getStatut() == filtreStatut).toList();
        }
        return list;
    }

    public List<Tache> detecterRetards() {
        List<Tache> retards = tacheRepository
                .findByDateFinBeforeAndStatutNot(LocalDate.now(), StatutTache.TERMINEE);
        retards.forEach(t -> {
            if (t.getStatut() != StatutTache.EN_RETARD) {
                tacheRepository.updateStatut(t.getId(), StatutTache.EN_RETARD);
                if (t.getMembre() != null) {
                    notificationService.envoyer(
                            "Tache '" + t.getTitre() + "' est en retard !",
                            t.getMembre(),
                            TypeNotification.TACHE_EN_RETARD,
                            t);
                }
            }
        });
        log.info("{} tache(s) en retard detectee(s)", retards.size());
        return retards;
    }

    public List<Tache> findAll() {
        return tacheRepository.findAll();
    }

    public Tache findById(Long id) {
        return tacheRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tache non trouvee"));
    }

    public void supprimer(Long id) {
        findById(id);
        forumEditionGuard.assertTacheOuverte(id);
        tacheRepository.deleteById(id);
    }
}