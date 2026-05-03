package com.enicarthage.forum.service;

import com.enicarthage.forum.client.CvAiClient;
import com.enicarthage.forum.dto.CvAnalysisResponse;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.CandidatureCVRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import java.nio.file.Files;
import java.util.List;
import java.util.Optional;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class CandidatureServiceTest {

    @Mock CandidatureCVRepository candidatureCVRepository;
    @Mock ForumProjectService forumProjectService;
    @Mock CvAiClient cvAiClient;
    @InjectMocks CandidatureCVService candidatureCVService;

    @Test
    void testerScoringIA_fallbackSansService() throws Exception {
        var tmp = Files.createTempFile("cvtest", ".pdf");
        CandidatureCV c = CandidatureCV.builder().id(1L).posteVise("Dev").fichierCV(tmp.toString()).build();
        when(candidatureCVRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(cvAiClient.analyze(any(), any(), any())).thenReturn(Optional.empty());

        candidatureCVService.analyserAvecIA(c);
        assertNotNull(c.getScoreIA());
        assertTrue(c.getScoreIA() >= 0 && c.getScoreIA() <= 100);
        assertNotNull(c.getJustificationIA());
        Files.deleteIfExists(tmp);
    }

    @Test
    void testerScoringIA_avecReponsePython() throws Exception {
        var tmp = Files.createTempFile("cvtest2", ".pdf");
        CandidatureCV c = CandidatureCV.builder().id(1L).posteVise("Dev").fichierCV(tmp.toString()).build();
        when(candidatureCVRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(cvAiClient.analyze(any(), any(), any())).thenReturn(Optional.of(
                new CvAnalysisResponse(82.5, "Bon profil", List.of("java", "spring"))));

        candidatureCVService.analyserAvecIA(c);
        assertEquals(82.5, c.getScoreIA());
        assertTrue(c.getJustificationIA().contains("Bon profil"));
        assertTrue(c.getCompetencesExtraites().contains("java"));
        Files.deleteIfExists(tmp);
    }

    @Test
    void testerAccepterCandidature() {
        CandidatureCV c = CandidatureCV.builder().id(1L).statut(StatutCandidature.EN_ATTENTE).build();
        when(candidatureCVRepository.findById(1L)).thenReturn(Optional.of(c));
        when(candidatureCVRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CandidatureCV result = candidatureCVService.accepter(1L);
        assertEquals(StatutCandidature.ACCEPTE, result.getStatut());
    }

    @Test
    void testerRefuserAvecCommentaire() {
        CandidatureCV c = CandidatureCV.builder().id(1L).statut(StatutCandidature.EN_ATTENTE).build();
        when(candidatureCVRepository.findById(1L)).thenReturn(Optional.of(c));
        when(candidatureCVRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        CandidatureCV result = candidatureCVService.refuser(1L, "Profil insuffisant");
        assertEquals(StatutCandidature.REFUSE, result.getStatut());
        assertEquals("Profil insuffisant", result.getCommentaire());
    }
}
