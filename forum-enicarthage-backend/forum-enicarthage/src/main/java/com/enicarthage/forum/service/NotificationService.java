package com.enicarthage.forum.service;

import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service @Transactional @Log4j2 @RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void envoyer(String message, Utilisateur destination,
                        TypeNotification type, Tache tache) {
        Notification notif = Notification.builder()
                .message(message)
                .destination(destination)
                .type(type)
                .tache(tache)
                .dateEnvoi(LocalDateTime.now())
                .lu(false)
                .build();
        notificationRepository.save(notif);
        log.debug("Notification envoyee a {} : {}", destination.getEmail(), message);
    }

    public List<Notification> getNotificationsNonLues(Long userId) {
        return notificationRepository.findByDestinationIdAndLuFalse(userId);
    }

    public List<Notification> getAllByUser(Long userId) {
        return notificationRepository.findByDestinationId(userId);
    }

    public Notification marquerLu(Long id) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvee"));
        notif.setLu(true);
        return notificationRepository.save(notif);
    }

    public void marquerToutLu(Long utilisateurId) {
        notificationRepository.findByDestinationId(utilisateurId).forEach(n -> {
            n.setLu(true);
            notificationRepository.save(n);
        });
    }
}