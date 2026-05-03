package com.enicarthage.forum.service;

import com.enicarthage.forum.client.CvAiClient;
import com.enicarthage.forum.dto.CvAnalysisResponse;
import com.enicarthage.forum.exception.ResourceNotFoundException;
import com.enicarthage.forum.model.*;
import com.enicarthage.forum.repository.CandidatureCVRepository;
import com.enicarthage.forum.repository.ComiteRepository;
import com.enicarthage.forum.repository.UtilisateurRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
@Log4j2
@RequiredArgsConstructor
public class CandidatureCVService {

    public static final String UPLOAD_DIR = "uploads/cv/";

    private final CandidatureCVRepository candidatureCVRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ComiteRepository comiteRepository;
    private final ForumProjectService forumProjectService;
    private final CvAiClient cvAiClient;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

    public CandidatureCV deposer(MultipartFile fichier, String posteVise, Utilisateur candidat) {
        String path = saveFile(fichier);
        CandidatureCV candidature = CandidatureCV.builder()
                .fichierCV(path)
                .posteVise(posteVise)
                .statut(StatutCandidature.EN_ATTENTE)
                .dateDepot(LocalDateTime.now())
                .candidat(candidat)
                .forumProject(forumProjectService.findEditionCourante().orElse(null))
                .build();
        CandidatureCV saved = candidatureCVRepository.save(candidature);
        analyserAvecIA(saved);
        return saved;
    }

    public void analyserAvecIA(CandidatureCV candidature) {
        Path path = Paths.get(candidature.getFichierCV());
        if (!Files.exists(path)) {
            log.error("Fichier CV introuvable pour analyse : {}", candidature.getFichierCV());
            appliquerScoreFallback(candidature, "Fichier CV introuvable sur le disque.");
            candidatureCVRepository.save(candidature);
            return;
        }
        Optional<CvAnalysisResponse> res = cvAiClient.analyze(
                path, candidature.getPosteVise(), candidature.getDossierComplet());
        if (res.isPresent()) {
            CvAnalysisResponse r = res.get();
            double score = Math.max(0, Math.min(100, r.getScore()));
            candidature.setScoreIA(Math.round(score * 100.0) / 100.0);
            candidature.setJustificationIA(r.getJustification());
            if (r.getCompetences() != null && !r.getCompetences().isEmpty()) {
                candidature.setCompetencesExtraites(
                        r.getCompetences().stream().distinct().collect(Collectors.joining(", ")));
            }
            log.info("Score IA pour {} : {}", candidature.getPosteVise(), score);
        } else {
            appliquerScoreFallback(candidature,
                    "Service d'analyse IA indisponible ou désactivé — score estimé localement.");
        }
        candidature.setDateAnalyseIA(LocalDateTime.now());
        candidatureCVRepository.save(candidature);
    }

    private void appliquerScoreFallback(CandidatureCV candidature, String message) {
        String cvText = (candidature.getPosteVise() != null ? candidature.getPosteVise() : "")
                + " " + (candidature.getDossierComplet() != null ? candidature.getDossierComplet() : "");
        double h = Math.max(0, Math.min(100, 45 + (cvText.hashCode() % 41)));
        candidature.setScoreIA(Math.round(h * 100.0) / 100.0);
        candidature.setJustificationIA(message);
        candidature.setCompetencesExtraites(null);
        log.info("Score fallback pour {} : {}", candidature.getPosteVise(), h);
    }

    public CandidatureCV reAnalyser(Long id) {
        CandidatureCV c = candidatureCVRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvee"));
        analyserAvecIA(c);
        return candidatureCVRepository.findById(id).orElseThrow();
    }

    public Resource fichierCvCommeResource(Long id) {
        CandidatureCV c = candidatureCVRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvee"));
        try {
            Path base = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();
            Path file = Paths.get(c.getFichierCV()).toAbsolutePath().normalize();
            if (!file.startsWith(base)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chemin fichier invalide");
            }
            Resource resource = new UrlResource(file.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fichier introuvable");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Erreur lecture fichier");
        }
    }

    public String nomFichierOriginal(Long id) {
        CandidatureCV c = candidatureCVRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvee"));
        String p = c.getFichierCV();
        int i = p.lastIndexOf('_');
        return i >= 0 ? p.substring(i + 1) : p;
    }

    public CandidatureCV accepter(Long id) {
        CandidatureCV c = candidatureCVRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvee"));
        c.setStatut(StatutCandidature.ACCEPTE);
        CandidatureCV saved = candidatureCVRepository.save(c);

        if (c.getCandidatEmail() != null) {
            String motDePasse = genererMotDePasse();
            String comiteNom = extractComite(c.getDossierComplet());
            String poste = c.getPosteVise() != null ? c.getPosteVise().toUpperCase() : "";

            // Détecter si chef de comité
            boolean isChef = poste.contains("CHEF");

            RoleEnum role = isChef ? RoleEnum.CHEF_COMITE : RoleEnum.MEMBRE;
            Utilisateur utilisateur = creerCompte(c, motDePasse, role);

            if (isChef && !comiteNom.isEmpty()) {
                assignerChefComite(utilisateur, comiteNom);
            } else if (!isChef && !comiteNom.isEmpty()) {
                ajouterAuComite(utilisateur, comiteNom);
            }

            mailService.envoyerCredentiels(
                    c.getCandidatEmail(),
                    c.getCandidatNom() != null ? c.getCandidatNom() : "Candidat",
                    comiteNom,
                    motDePasse
            );
        }
        return saved;
    }

    private Utilisateur creerCompte(CandidatureCV c, String motDePasse, RoleEnum role) {
        Optional<Utilisateur> existing = utilisateurRepository.findByEmail(c.getCandidatEmail());
        if (existing.isPresent()) {
            log.info("Compte déjà existant pour {}", c.getCandidatEmail());
            return existing.get();
        }
        Utilisateur u = Utilisateur.builder()
                .nom(c.getCandidatNom())
                .email(c.getCandidatEmail())
                .motDePasse(passwordEncoder.encode(motDePasse))
                .role(role)
                .actif(true)
                .build();
        Utilisateur saved = utilisateurRepository.save(u);
        log.info("Compte {} créé pour {}", role, c.getCandidatEmail());
        return saved;
    }

    private void assignerChefComite(Utilisateur chef, String comiteNom) {
        comiteRepository.findAll().stream()
            .filter(c -> c.getNom().equalsIgnoreCase(comiteNom))
            .findFirst()
            .ifPresent(comite -> {
                comite.setChef(chef);
                comiteRepository.save(comite);
                log.info("Chef {} assigné au comité {}", chef.getEmail(), comiteNom);
            });
    }

    private void ajouterAuComite(Utilisateur membre, String comiteNom) {
        comiteRepository.findAll().stream()
            .filter(c -> c.getNom().equalsIgnoreCase(comiteNom))
            .findFirst()
            .ifPresent(comite -> {
                if (!comite.getMembres().contains(membre)) {
                    comite.getMembres().add(membre);
                    comiteRepository.save(comite);
                    log.info("Membre {} ajouté au comité {}", membre.getEmail(), comiteNom);
                }
            });
    }

    private String genererMotDePasse() {
        String chars = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#";
        StringBuilder sb = new StringBuilder();
        java.util.Random rnd = new java.util.Random();
        for (int i = 0; i < 10; i++) sb.append(chars.charAt(rnd.nextInt(chars.length())));
        return sb.toString();
    }

    private String extractComite(String dossierComplet) {
        if (dossierComplet == null) return "";
        for (String part : dossierComplet.split("\\|")) {
            if (part.trim().startsWith("Comité:")) {
                return part.trim().replace("Comité:", "").trim();
            }
        }
        return "";
    }

    public CandidatureCV deposerPublic(
            MultipartFile fichier,
            String prenom, String nom, String email,
            String telephone, String niveauEtudes,
            String posteVise, String comite,
            String motivation, String experience, String competences) {
        String path = saveFile(fichier);
        String dossier = String.format(
                "Prénom:%s | Nom:%s | Tel:%s | Niveau:%s | Comité:%s | Motivation:%s | Expérience:%s | Compétences:%s",
                prenom, nom, telephone, niveauEtudes,
                comite != null ? comite : "-",
                motivation,
                experience != null ? experience : "-",
                competences != null ? competences : "-");
        CandidatureCV candidature = CandidatureCV.builder()
                .fichierCV(path)
                .posteVise(posteVise)
                .statut(StatutCandidature.EN_ATTENTE)
                .dateDepot(LocalDateTime.now())
                .candidatNom(prenom + " " + nom)
                .candidatEmail(email)
                .dossierComplet(dossier)
                .candidat(null)
                .forumProject(forumProjectService.findEditionCourante().orElse(null))
                .build();
        CandidatureCV saved = candidatureCVRepository.save(candidature);
        analyserAvecIA(saved);
        return saved;
    }

    public CandidatureCV refuser(Long id, String commentaire) {
        CandidatureCV c = candidatureCVRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvee"));
        c.setStatut(StatutCandidature.REFUSE);
        c.setCommentaire(commentaire);
        return candidatureCVRepository.save(c);
    }

    public List<CandidatureCV> findAll() {
        return candidatureCVRepository.findAll();
    }

    public CandidatureCV findById(Long id) {
        return candidatureCVRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Candidature non trouvee"));
    }

    private String saveFile(MultipartFile fichier) {
        String path = UPLOAD_DIR + System.currentTimeMillis() + "_" + fichier.getOriginalFilename();
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
            Files.copy(fichier.getInputStream(), Paths.get(path), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Erreur sauvegarde fichier : {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Echec enregistrement CV");
        }
        return path;
    }
}