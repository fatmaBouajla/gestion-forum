package com.enicarthage.forum.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Notification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String message;
    private boolean lu = false;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateEnvoi;

    @Enumerated(EnumType.STRING)
    private TypeNotification type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "destination_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilisateur destination;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "tache_id")
    @JsonIgnoreProperties({"commentaires", "membre", "comite", "hibernateLazyInitializer"})
    private Tache tache;
}