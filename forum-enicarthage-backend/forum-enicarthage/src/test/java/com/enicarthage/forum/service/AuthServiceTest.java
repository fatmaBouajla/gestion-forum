package com.enicarthage.forum.service;

import com.enicarthage.forum.dto.*;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.UtilisateurRepository;
import com.enicarthage.forum.security.JwtUtil;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UtilisateurRepository utilisateurRepository;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authenticationManager;
    @Mock PasswordEncoder passwordEncoder;
    @InjectMocks AuthService authService;

    @Test
    void testerLoginReussi() {
        LoginRequest req = new LoginRequest();
        req.setEmail("admin@enicarthage.tn");
        req.setMotDePasse("pass");

        Utilisateur user = Utilisateur.builder()
                .email("admin@enicarthage.tn").role(RoleEnum.ADMIN).build();

        when(utilisateurRepository.findByEmail(req.getEmail())).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(anyString(), anyString())).thenReturn("jwt-token");
        when(authenticationManager.authenticate(any())).thenReturn(null);

        JwtResponse response = authService.login(req);
        assertEquals("jwt-token", response.getToken());
        assertEquals("ADMIN", response.getRole());
    }

    @Test
    void testerTokenInvalide() {
        when(jwtUtil.validateToken("mauvais")).thenReturn(false);
        assertFalse(jwtUtil.validateToken("mauvais"));
    }

    @Test
    void testerRegisterEmailDuplique() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("existe@test.com");
        when(utilisateurRepository.existsByEmail("existe@test.com")).thenReturn(true);
        assertThrows(IllegalArgumentException.class, () -> authService.register(req));
    }
}