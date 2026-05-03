package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service @Transactional @Log4j2 @RequiredArgsConstructor
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public List<Utilisateur> findAll() { return utilisateurRepository.findAll(); }

    public Utilisateur findById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve : " + id));
    }

    public Utilisateur creer(Utilisateur u) {
        u.setMotDePasse(passwordEncoder.encode(u.getMotDePasse()));
        return utilisateurRepository.save(u);
    }

    public Utilisateur modifier(Long id, Utilisateur data) {
        Utilisateur u = findById(id);
        u.setNom(data.getNom());
        u.setEmail(data.getEmail());
        if (data.getMotDePasse() != null && !data.getMotDePasse().isBlank())
            u.setMotDePasse(passwordEncoder.encode(data.getMotDePasse()));
        return utilisateurRepository.save(u);
    }

    public void supprimer(Long id) { utilisateurRepository.deleteById(id); }

    public Utilisateur activerCompte(Long id, boolean actif) {
        Utilisateur u = findById(id);
        u.setActif(actif);
        log.info("Compte {} : actif={}", u.getEmail(), actif);
        return utilisateurRepository.save(u);
    }

    public Utilisateur assignerRole(Long id, RoleEnum role) {
        Utilisateur u = findById(id);
        u.setRole(role);
        log.info("Role {} assigne a {}", role, u.getEmail());
        return utilisateurRepository.save(u);
    }
    public Utilisateur findByEmail(String email) {
        return utilisateurRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouve : " + email));
    }
}