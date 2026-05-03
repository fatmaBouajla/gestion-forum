package com.enicarthage.forum.repository;
import com.enicarthage.forum.model.ForumProject;
import com.enicarthage.forum.model.StatutProjet;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Collection;
import java.util.List;
public interface ForumProjectRepository extends JpaRepository<ForumProject, Long> {
    List<ForumProject> findByStatut(StatutProjet statut);
    List<ForumProject> findByStatutIn(Collection<StatutProjet> statuts, Sort sort);
}