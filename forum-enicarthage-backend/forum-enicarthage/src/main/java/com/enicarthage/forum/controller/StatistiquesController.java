package com.enicarthage.forum.controller;

import com.enicarthage.forum.service.StatistiquesService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','COMITE_PILOTAGE','COORDINATRICE')")
public class StatistiquesController {

    private final StatistiquesService statistiquesService;

    @GetMapping("/kpis")
    public Map<String, Object> getKPIs() { return statistiquesService.getKPIs(); }

    @GetMapping("/comites")
    public List<Map<String, Object>> getAvancementParComite() {
        return statistiquesService.getAvancementParComite();
    }

    @GetMapping("/editions")
    public List<Map<String, Object>> comparerEditions() {
        return statistiquesService.comparerEditions();
    }
}