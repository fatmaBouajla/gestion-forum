package com.enicarthage.forum.aop;

import lombok.extern.log4j.Log4j2;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.*;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Log4j2
public class LoggingAspect {

    @Around("execution(* com.enicarthage.forum.service.*.*(..))")
    public Object logServiceCall(ProceedingJoinPoint pjp) throws Throwable {
        String method = pjp.getSignature().toShortString();
        long start = System.currentTimeMillis();
        log.debug("-> Entree : {}", method);
        try {
            Object result = pjp.proceed();
            long duration = System.currentTimeMillis() - start;
            log.debug("<- Sortie : {} ({}ms)", method, duration);
            return result;
        } catch (Throwable ex) {
            log.error("Erreur dans {} : {}", method, ex.getMessage());
            throw ex;
        }
    }
}
