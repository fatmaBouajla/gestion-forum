package com.enicarthage.forum.service;

import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class StatistiquesServiceTest {

    @Mock TacheRepository tacheRepository;
    @Mock ComiteRepository comiteRepository;
    @Mock CandidatureCVRepository candidatureCVRepository;
    @Mock WorkshopRepository workshopRepository;
    @Mock ForumProjectRepository forumProjectRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @InjectMocks StatistiquesService statistiquesService;

    @Test
    void testerKPIs() {
        Tache t1 = Tache.builder().statut(StatutTache.TERMINEE).build();
        Tache t2 = Tache.builder().statut(StatutTache.EN_RETARD).build();
        Tache t3 = Tache.builder().statut(StatutTache.EN_COURS).build();

        when(tacheRepository.findAll()).thenReturn(List.of(t1, t2, t3));
        when(candidatureCVRepository.count()).thenReturn(5L);
        when(candidatureCVRepository.findByStatutOrderByScoreIADesc(any())).thenReturn(List.of());
        when(workshopRepository.findByStatut(any())).thenReturn(List.of());
        when(workshopRepository.count()).thenReturn(10L);
        when(comiteRepository.count()).thenReturn(3L);
        when(utilisateurRepository.count()).thenReturn(20L);

        Map<String, Object> kpis = statistiquesService.getKPIs();
        assertEquals(3, kpis.get("totalTaches"));
        assertEquals(1L, kpis.get("tachesTerminees"));
        assertEquals("33%", kpis.get("tauxAvancement"));
    }
}