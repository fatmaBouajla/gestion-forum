package com.enicarthage.forum.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "comites")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Comite {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nom;
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "forum_project_id")
    @JsonIgnoreProperties({"comites", "hibernateLazyInitializer"})
    private ForumProject forumProject;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "chef_id")
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    private Utilisateur chef;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "comite_membres",
        joinColumns = @JoinColumn(name = "comite_id"),
        inverseJoinColumns = @JoinColumn(name = "utilisateur_id"))
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @Builder.Default
    private List<Utilisateur> membres = new ArrayList<>();
}