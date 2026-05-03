package com.enicarthage.forum.repository;
import com.enicarthage.forum.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {}