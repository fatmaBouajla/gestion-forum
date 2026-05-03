package com.enicarthage.forum.repository;
import com.enicarthage.forum.model.Workshop;
import com.enicarthage.forum.model.StatutWorkshop;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface WorkshopRepository extends JpaRepository<Workshop, Long> {
    List<Workshop> findByStatut(StatutWorkshop statut);
    List<Workshop> findByComiteId(Long comiteId);
}