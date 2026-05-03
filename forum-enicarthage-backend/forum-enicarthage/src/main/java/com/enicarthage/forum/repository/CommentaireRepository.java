package com.enicarthage.forum.repository;
import com.enicarthage.forum.model.Commentaire;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface CommentaireRepository extends JpaRepository<Commentaire, Long> {
    List<Commentaire> findByTacheId(Long tacheId);
}