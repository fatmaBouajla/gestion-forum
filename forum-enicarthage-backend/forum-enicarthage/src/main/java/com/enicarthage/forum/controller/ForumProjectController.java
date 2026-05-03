package com.enicarthage.forum.controller;

import com.enicarthage.forum.model.ForumProject;
import com.enicarthage.forum.service.ForumProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/forum-projects")
@RequiredArgsConstructor
public class ForumProjectController {

    private final ForumProjectService forumProjectService;

    @GetMapping
    public List<ForumProject> getAll() {
        return forumProjectService.findAll();
    }

    @GetMapping("/current")
    public ResponseEntity<ForumProject> getCurrent() {
        return forumProjectService.findEditionCourante()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}")
    public ForumProject getById(@PathVariable Long id) {
        return forumProjectService.findById(id);
    }

    @GetMapping("/historique")
    public List<ForumProject> getHistorique() {
        return forumProjectService.getHistorique();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ForumProject creer(@RequestBody ForumProject fp) {
        return forumProjectService.creer(fp);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ForumProject modifier(@PathVariable Long id, @RequestBody ForumProject fp) {
        return forumProjectService.modifier(id, fp);
    }

    @PatchMapping("/{id}/archiver")
    @PreAuthorize("hasRole('ADMIN')")
    public ForumProject archiver(@PathVariable Long id) {
        return forumProjectService.archiver(id);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> supprimer(@PathVariable Long id) {
        forumProjectService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}
