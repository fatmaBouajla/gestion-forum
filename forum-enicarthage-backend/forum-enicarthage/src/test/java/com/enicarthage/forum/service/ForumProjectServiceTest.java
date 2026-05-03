package com.enicarthage.forum.service;

import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.ForumProjectRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class ForumProjectServiceTest {

    @Mock ForumProjectRepository forumProjectRepository;
    @InjectMocks ForumProjectService forumProjectService;

    @Test
    void testerCreationAvecStatutPlanification() {
        ForumProject fp = ForumProject.builder().nom("Forum 2025").edition("XI").build();
        when(forumProjectRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        ForumProject result = forumProjectService.creer(fp);
        assertEquals(StatutProjet.PLANIFICATION, result.getStatut());
    }

    @Test
    void testerArchivage() {
        ForumProject fp = ForumProject.builder().id(1L).statut(StatutProjet.EN_COURS).build();
        when(forumProjectRepository.findById(1L)).thenReturn(Optional.of(fp));
        when(forumProjectRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        ForumProject result = forumProjectService.archiver(1L);
        assertEquals(StatutProjet.CLOTURE, result.getStatut());
    }

    @Test
    void testerGetHistorique() {
        when(forumProjectRepository.findByStatut(StatutProjet.CLOTURE))
                .thenReturn(List.of(ForumProject.builder().statut(StatutProjet.CLOTURE).build()));
        assertEquals(1, forumProjectService.getHistorique().size());
    }
}