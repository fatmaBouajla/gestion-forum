package com.enicarthage.forum.controller;

import com.enicarthage.forum.dto.NotificationDto;
import com.enicarthage.forum.model.Notification;
import com.enicarthage.forum.repository.UtilisateurRepository;
import com.enicarthage.forum.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UtilisateurRepository utilisateurRepository;

    @GetMapping("/mes-notifications")
    public List<NotificationDto> getMesNotifications(Authentication auth) {
        return utilisateurRepository.findByEmail(auth.getName())
                .map(u -> notificationService.getAllByUser(u.getId())
                        .stream().map(this::toDto).toList())
                .orElse(List.of());
    }

    @GetMapping("/non-lues")
    public List<NotificationDto> getNonLues(Authentication auth) {
        return utilisateurRepository.findByEmail(auth.getName())
                .map(u -> notificationService.getNotificationsNonLues(u.getId())
                        .stream().map(this::toDto).toList())
                .orElse(List.of());
    }

    @PutMapping("/{id}/lu")
    public NotificationDto marquerLu(@PathVariable Long id) {
        return toDto(notificationService.marquerLu(id));
    }

    @PatchMapping("/tout-lu")
    public void marquerToutLu(Authentication auth) {
        utilisateurRepository.findByEmail(auth.getName())
                .ifPresent(u -> notificationService.marquerToutLu(u.getId()));
    }

    private NotificationDto toDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .message(n.getMessage())
                .lu(n.isLu())
                .type(n.getType() != null ? n.getType().name() : null)
                .tacheId(n.getTache() != null ? n.getTache().getId() : null)
                .destinationId(n.getDestination() != null ? n.getDestination().getId() : null)
                .dateEnvoi(n.getDateEnvoi())
                .build();
    }
}