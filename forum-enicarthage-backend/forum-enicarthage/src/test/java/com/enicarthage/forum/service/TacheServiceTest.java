package com.enicarthage.forum.service;

import com.enicarthage.forum.dto.TacheDTO;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.*;
import com.enicarthage.forum.security.TacheAuthorizationHelper;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.time.LocalDate;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class TacheServiceTest {

    @Mock TacheRepository tacheRepository;
    @Mock ComiteRepository comiteRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock NotificationService notificationService;
    @Mock ForumEditionGuard forumEditionGuard;
    @Mock TacheAuthorizationHelper tacheAuthorizationHelper;
    @InjectMocks TacheService tacheService;

    @BeforeEach
    void init() {
        doNothing().when(forumEditionGuard).assertForumOuvert(anyLong());
        doNothing().when(forumEditionGuard).assertTacheOuverte(anyLong());
    }

    @Test
    void testerCreationTache() {
        TacheDTO dto = new TacheDTO();
        dto.setTitre("Preparer salle");
        dto.setDateDebut(LocalDate.now());
        dto.setDateFin(LocalDate.now().plusDays(5));
        dto.setPriorite(PrioriteTache.NORMALE);
        dto.setComiteId(1L);

        Comite comite = new Comite();
        comite.setId(1L);
        when(comiteRepository.findById(1L)).thenReturn(Optional.of(comite));
        when(tacheRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Tache result = tacheService.creer(dto);
        assertEquals(StatutTache.A_FAIRE, result.getStatut());
        assertEquals("Preparer salle", result.getTitre());
    }

    @Test
    void testerDetectionRetard() {
        Utilisateur membre = Utilisateur.builder().email("u@test.com").build();
        Tache t = Tache.builder().titre("Tache expirée")
                .dateFin(LocalDate.now().minusDays(2))
                .statut(StatutTache.EN_COURS).membre(membre).build();

        when(tacheRepository.findByDateFinBeforeAndStatutNot(any(), any())).thenReturn(List.of(t));
        when(tacheRepository.save(any())).thenReturn(t);

        List<Tache> retards = tacheService.detecterRetards();
        assertEquals(1, retards.size());
        verify(tacheRepository, times(1)).save(any());
    }

    @Test
    void testerChangementStatut() {
        Utilisateur u = Utilisateur.builder().id(5L).email("m@test.com").role(RoleEnum.MEMBRE).build();
        Comite comite = Comite.builder().id(1L).build();
        Tache tache = Tache.builder().id(1L).statut(StatutTache.A_FAIRE).comite(comite).membre(u).build();

        when(tacheRepository.findById(1L)).thenReturn(Optional.of(tache));
        when(utilisateurRepository.findByEmail("m@test.com")).thenReturn(Optional.of(u));
        when(tacheAuthorizationHelper.peutAccederTache(u, tache)).thenReturn(true);
        when(tacheRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Tache result = tacheService.changerStatut(1L, StatutTache.EN_COURS, "m@test.com");
        assertEquals(StatutTache.EN_COURS, result.getStatut());
    }
}
