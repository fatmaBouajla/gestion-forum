package com.enicarthage.forum.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Log4j2
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String from;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public void envoyerCredentiels(String email, String nom, String comite, String motDePasse) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(from);
            message.setTo(email);
            message.setSubject("🎉 Candidature acceptée — Forum ENICarthage");
            message.setText(
                "Bonjour " + nom + ",\n\n" +
                "Félicitations ! Votre candidature pour le comité " + comite + " a été acceptée.\n\n" +
                "Voici vos identifiants de connexion :\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                "  Email       : " + email + "\n" +
                "  Mot de passe : " + motDePasse + "\n" +
                "━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                "Connectez-vous sur : " + frontendUrl + "/auth/login\n\n" +
                "Nous vous recommandons de changer votre mot de passe après la première connexion.\n\n" +
                "Bienvenue dans l'équipe du Forum ENICarthage !\n\n" +
                "Cordialement,\nL'équipe Forum ENICarthage"
            );
            mailSender.send(message);
            log.info("Email credentials envoyé à {}", email);
        } catch (Exception e) {
            log.error("Erreur envoi email à {} : {}", email, e.getMessage());
        }
    }
}