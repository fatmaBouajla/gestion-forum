package com.enicarthage.forum.controller;

import com.enicarthage.forum.dto.CandidatureCVDto;
import com.enicarthage.forum.model.CandidatureCV;
import com.enicarthage.forum.service.CandidatureCVService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/candidatures")
@RequiredArgsConstructor
public class CandidatureCVController {

    private final CandidatureCVService candidatureCVService;

    @PostMapping
    public ResponseEntity<CandidatureCVDto> deposerPublic(
            @RequestParam MultipartFile cv,
            @RequestParam String prenom,
            @RequestParam String nom,
            @RequestParam String email,
            @RequestParam String telephone,
            @RequestParam String niveauEtudes,
            @RequestParam String posteVise,
            @RequestParam(required = false) String comiteSouhaite,
            @RequestParam(required = false) String comiteChoix,
            @RequestParam String motivation,
            @RequestParam(required = false) String experience,
            @RequestParam(required = false) String competences) {
        CandidatureCV saved = candidatureCVService.deposerPublic(
                cv, prenom, nom, email, telephone,
                niveauEtudes, posteVise,
                comiteSouhaite != null ? comiteSouhaite : comiteChoix,
                motivation, experience, competences);
        return ResponseEntity.ok(toDto(saved));
    }

    @PostMapping("/{id}/analyser-ia")
    @PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE')")
    public CandidatureCVDto analyserIA(@PathVariable Long id) {
        return toDto(candidatureCVService.reAnalyser(id));
    }

    @GetMapping("/{id}/telecharger-cv")
    @PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE','CHEF_COMITE')")
    public ResponseEntity<Resource> telechargerCv(@PathVariable Long id) {
        Resource resource = candidatureCVService.fichierCvCommeResource(id);
        String filename = candidatureCVService.nomFichierOriginal(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE','CHEF_COMITE')")
    public List<CandidatureCVDto> getAll() {
        return candidatureCVService.findAll().stream().map(this::toDto).toList();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE','CHEF_COMITE')")
    public CandidatureCVDto getById(@PathVariable Long id) {
        return toDto(candidatureCVService.findById(id));
    }

    @PutMapping("/{id}/accepter")
    @PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE','CHEF_COMITE')")
    public CandidatureCVDto accepter(@PathVariable Long id) {
        return toDto(candidatureCVService.accepter(id));
    }

    @PutMapping("/{id}/refuser")
    @PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE','CHEF_COMITE')")
    public CandidatureCVDto refuser(@PathVariable Long id, @RequestParam String commentaire) {
        return toDto(candidatureCVService.refuser(id, commentaire));
    }

    // ← Conversion entité → DTO sans relations circulaires
    private CandidatureCVDto toDto(CandidatureCV c) {
        return CandidatureCVDto.builder()
                .id(c.getId())
                .fichierCV(c.getFichierCV())
                .posteVise(c.getPosteVise())
                .scoreIA(c.getScoreIA())
                .justificationIA(c.getJustificationIA())
                .competencesExtraites(c.getCompetencesExtraites())
                .statut(c.getStatut() != null ? c.getStatut().name() : null)
                .commentaire(c.getCommentaire())
                .dossierComplet(c.getDossierComplet())
                .candidatNom(c.getCandidatNom() != null ? c.getCandidatNom()
                        : (c.getCandidat() != null ? c.getCandidat().getNom() : null))
                .candidatEmail(c.getCandidatEmail() != null ? c.getCandidatEmail()
                        : (c.getCandidat() != null ? c.getCandidat().getEmail() : null))
                .dateDepot(c.getDateDepot())
                .dateAnalyseIA(c.getDateAnalyseIA())
                .build();
    }
}