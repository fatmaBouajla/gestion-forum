package com.enicarthage.forum.service;

import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.WorkshopRepository;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.junit.jupiter.api.*;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class WorkshopServiceTest {

    @Mock WorkshopRepository workshopRepository;
    @Mock ForumEditionGuard forumEditionGuard;
    @InjectMocks WorkshopService workshopService;

    @BeforeEach
    void init() {
        doNothing().when(forumEditionGuard).assertWorkshopOuvert(anyLong());
    }

    @Test
    void testerValidation() {
        Workshop w = Workshop.builder().id(1L).titre("IA & Emploi").statut(StatutWorkshop.PROPOSE).build();
        when(workshopRepository.findById(1L)).thenReturn(Optional.of(w));
        when(workshopRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals(StatutWorkshop.VALIDE, workshopService.valider(1L).getStatut());
    }

    @Test
    void testerRefus() {
        Workshop w = Workshop.builder().id(1L).statut(StatutWorkshop.PROPOSE).build();
        when(workshopRepository.findById(1L)).thenReturn(Optional.of(w));
        when(workshopRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        assertEquals(StatutWorkshop.REFUSE, workshopService.refuser(1L, "Complet").getStatut());
    }
}
