package com.enicarthage.forum.service;

import com.enicarthage.forum.dto.*;
import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.RoleEnum;
import com.enicarthage.forum.model.Utilisateur;
import com.enicarthage.forum.repository.UtilisateurRepository;
import com.enicarthage.forum.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @Transactional @Log4j2 @RequiredArgsConstructor
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public JwtResponse login(LoginRequest request) {
        log.info("Tentative de connexion : {}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getMotDePasse()));
        var user = utilisateurRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve"));
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        log.info("Connexion reussie : {}", request.getEmail());
        return new JwtResponse(token, user.getEmail(), user.getRole().name());
    }

    /**
     * Inscription publique : toujours rôle MEMBRE (les autres rôles sont créés par l'ADMIN).
     * Le champ {@code role} éventuel du formulaire est ignoré pour respecter le cahier des charges.
     */
    public Utilisateur register(RegisterRequest request) {
        log.info("Inscription : {}", request.getEmail());
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email deja utilise : " + request.getEmail());
        }
        Utilisateur user = Utilisateur.builder()
                .nom(request.getNom())
                .email(request.getEmail())
                .motDePasse(passwordEncoder.encode(request.getMotDePasse()))
                .role(RoleEnum.MEMBRE)
                .actif(true)
                .build();
        return utilisateurRepository.save(user);
    }
}