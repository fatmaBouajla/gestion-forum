package com.enicarthage.forum.repository;
import com.enicarthage.forum.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByDestinationIdAndLuFalse(Long destinationId);
    List<Notification> findByDestinationId(Long destinationId);
}