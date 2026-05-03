package com.enicarthage.forum.scheduler;

import com.enicarthage.forum.service.TacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Log4j2
@RequiredArgsConstructor
public class TacheScheduler {

    private final TacheService tacheService;

    // Toutes les heures
    @Scheduled(cron = "0 0 * * * *")
    public void verifierRetards() {
        log.info("=== Verification des taches en retard ===");
        tacheService.detecterRetards();
    }
}
