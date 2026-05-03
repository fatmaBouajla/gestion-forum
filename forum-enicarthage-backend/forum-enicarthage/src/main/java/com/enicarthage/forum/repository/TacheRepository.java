package com.enicarthage.forum.repository;

import com.enicarthage.forum.model.Tache;
import com.enicarthage.forum.model.StatutTache;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface TacheRepository extends JpaRepository<Tache, Long> {
    List<Tache> findByStatut(StatutTache statut);
    List<Tache> findByComiteId(Long comiteId);
    List<Tache> findByMembreId(Long membreId);
    List<Tache> findByDateFinBeforeAndStatutNot(LocalDate date, StatutTache statut);

    @Modifying
    @Query("UPDATE Tache t SET t.statut = :statut WHERE t.id = :id")
    void updateStatut(@Param("id") Long id, @Param("statut") StatutTache statut);
}