package com.enicarthage.forum.client;

import com.enicarthage.forum.dto.CvAnalysisResponse;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

import java.nio.file.Path;
import java.time.Duration;
import java.util.Optional;

@Component
@Log4j2
public class CvAiClient {

    private final boolean enabled;
    private final WebClient webClient;

    public CvAiClient(
            @Value("${app.cv-ai.enabled:true}") boolean enabled,
            @Value("${app.cv-ai.base-url:http://127.0.0.1:8000}") String baseUrl) {
        this.enabled = enabled;
        String base = baseUrl.trim().replaceAll("/+$", "");
        ExchangeStrategies strategies = ExchangeStrategies.builder()
                .codecs(c -> c.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
                .build();
        this.webClient = WebClient.builder()
                .baseUrl(base)
                .exchangeStrategies(strategies)
                .build();
    }

    public Optional<CvAnalysisResponse> analyze(Path pdfPath, String posteVise, String contexte) {
        if (!enabled) {
            log.debug("CV IA désactivé (app.cv-ai.enabled=false)");
            return Optional.empty();
        }
        try {
            MultipartBodyBuilder mb = new MultipartBodyBuilder();
            mb.part("file", new FileSystemResource(pdfPath.toFile()))
                    .filename(pdfPath.getFileName().toString())
                    .contentType(MediaType.APPLICATION_PDF);
            mb.part("poste_vise", posteVise != null ? posteVise : "");
            mb.part("contexte", contexte != null ? contexte : "");

            CvAnalysisResponse body = webClient.post()
                    .uri("/analyze")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(BodyInserters.fromMultipartData(mb.build()))
                    .retrieve()
                    .bodyToMono(CvAnalysisResponse.class)
                    .block(Duration.ofSeconds(90));

            return Optional.ofNullable(body);
        } catch (Exception e) {
            log.warn("Appel microservice CV IA échoué : {}", e.getMessage());
            return Optional.empty();
        }
    }
}
