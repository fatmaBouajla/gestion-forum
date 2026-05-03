package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
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
class ComiteServiceTest {

    @Mock ComiteRepository comiteRepository;
    @Mock UtilisateurRepository utilisateurRepository;
    @Mock ForumProjectRepository forumProjectRepository;
    @Mock ForumEditionGuard forumEditionGuard;
    @InjectMocks ComiteService comiteService;

    @BeforeEach
    void init() {
        doNothing().when(forumEditionGuard).assertForumOuvert(anyLong());
    }

    @Test
    void testerAjouterMembre() {
        Utilisateur admin = Utilisateur.builder().id(99L).email("a@a.com").role(RoleEnum.ADMIN).build();
        Utilisateur u = Utilisateur.builder().id(2L).email("m@test.com").build();
        Comite comite = Comite.builder().id(1L).nom("Com. Logistique").membres(new ArrayList<>()).build();

        when(comiteRepository.findById(1L)).thenReturn(Optional.of(comite));
        when(utilisateurRepository.findByEmail("a@a.com")).thenReturn(Optional.of(admin));
        when(utilisateurRepository.findById(2L)).thenReturn(Optional.of(u));
        when(comiteRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        Comite result = comiteService.ajouterMembre(1L, 2L, "a@a.com");
        assertEquals(1, result.getMembres().size());
    }

    @Test
    void testerComiteIntrouvable() {
        when(comiteRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> comiteService.findById(99L));
    }
}
