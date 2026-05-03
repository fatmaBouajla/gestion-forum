package com.enicarthage.forum.service;

import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@Log4j2
@RequiredArgsConstructor
public class StatistiquesService {

    private final TacheRepository tacheRepository;
    private final ComiteRepository comiteRepository;
    private final CandidatureCVRepository candidatureCVRepository;
    private final WorkshopRepository workshopRepository;
    private final ForumProjectRepository forumProjectRepository;
    private final UtilisateurRepository utilisateurRepository;

    public Map<String, Object> getKPIs() {
        Map<String, Object> kpis = new LinkedHashMap<>();
        List<Tache> toutes = tacheRepository.findAll();
        long terminees = toutes.stream().filter(t -> t.getStatut() == StatutTache.TERMINEE).count();
        long enRetard = toutes.stream().filter(t -> t.getStatut() == StatutTache.EN_RETARD).count();
        long aFaire = toutes.stream().filter(t -> t.getStatut() == StatutTache.A_FAIRE).count();
        long enCours = toutes.stream().filter(t -> t.getStatut() == StatutTache.EN_COURS).count();

        int avancementPct = toutes.isEmpty() ? 0
                : (int) Math.round((double) terminees / toutes.size() * 100);

        kpis.put("totalTaches", toutes.size());
        kpis.put("tachesTerminees", terminees);
        kpis.put("tachesEnRetard", enRetard);
        kpis.put("tachesAFaire", aFaire);
        kpis.put("tachesEnCours", enCours);
        kpis.put("tauxAvancement", toutes.isEmpty() ? "0%" :
                Math.round((double) terminees / toutes.size() * 100) + "%");
        kpis.put("avancementGlobal", avancementPct);
        kpis.put("totalCandidatures", candidatureCVRepository.count());
        kpis.put("candidaturesAcceptees",
                candidatureCVRepository.findByStatutOrderByScoreIADesc(StatutCandidature.ACCEPTE).size());
        kpis.put("workshopsValides",
                workshopRepository.findByStatut(StatutWorkshop.VALIDE).size());
        kpis.put("totalWorkshops", workshopRepository.count());
        kpis.put("totalComites", comiteRepository.count());
        kpis.put("totalUtilisateurs", utilisateurRepository.count());
        log.debug("KPIs calcules");
        return kpis;
    }

    public List<Map<String, Object>> getAvancementParComite() {
        return comiteRepository.findAll().stream().map(comite -> {
            List<Tache> taches = tacheRepository.findByComiteId(comite.getId());
            long terminees = taches.stream().filter(t -> t.getStatut() == StatutTache.TERMINEE).count();
            Map<String, Object> stats = new LinkedHashMap<>();
            stats.put("comiteId", comite.getId());
            stats.put("comiteNom", comite.getNom());
            stats.put("totalTaches", taches.size());
            stats.put("terminees", terminees);
            stats.put("total", taches.size());
            stats.put("avancement", taches.isEmpty() ? 0 :
                    (int) Math.round((double) terminees / taches.size() * 100));
            return stats;
        }).collect(Collectors.toList());
    }

    public List<Map<String, Object>> comparerEditions() {
        return forumProjectRepository.findAll().stream().map(fp -> {
            Map<String, Object> data = new LinkedHashMap<>();
            data.put("edition", fp.getEdition());
            data.put("nom", fp.getNom());
            data.put("statut", fp.getStatut());
            data.put("nbComites", fp.getComites() != null ? fp.getComites().size() : 0);
            return data;
        }).collect(Collectors.toList());
    }
}
