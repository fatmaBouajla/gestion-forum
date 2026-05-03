package com.enicarthage.forum.repository;
import com.enicarthage.forum.model.Comite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ComiteRepository extends JpaRepository<Comite, Long> {
    List<Comite> findByForumProjectId(Long forumProjectId);
    Optional<Comite> findByChefId(Long chefId); // ✅ AJOUT
}