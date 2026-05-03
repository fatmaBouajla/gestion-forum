package com.enicarthage.forum;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ForumEnicarthageApplication {
    public static void main(String[] args) {
        SpringApplication.run(ForumEnicarthageApplication.class, args);
    }
}
