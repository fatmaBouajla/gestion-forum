package com.enicarthage.forum.repository;

import com.enicarthage.forum.model.Workshop;
import com.enicarthage.forum.model.StatutWorkshop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WorkshopRepository extends JpaRepository<Workshop, Long> {

    List<Workshop> findByStatut(StatutWorkshop statut);

    List<Workshop> findByComiteId(Long comiteId);

    // Query explicite pour éviter les problèmes de lazy loading
    @Query("SELECT w FROM Workshop w JOIN w.comite c JOIN c.chef chef WHERE chef.email = :email")
    List<Workshop> findByComiteChefEmail(@Param("email") String email);
}