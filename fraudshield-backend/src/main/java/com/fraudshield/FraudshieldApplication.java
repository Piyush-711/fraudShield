package com.fraudshield;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FraudshieldApplication {
    public static void main(String[] args) {
        SpringApplication.run(FraudshieldApplication.class, args);
        System.out.println("""
                
                ╔═══════════════════════════════════════════════════╗
                ║   🛡️  FraudShield Backend Started Successfully!   ║
                ║                                                   ║
                ║   API Base URL  : http://localhost:8081/api/v1    ║
                ║   Swagger UI    : http://localhost:8081/swagger-ui.html ║
                ║   H2 Console    : http://localhost:8081/h2-console║
                ╚═══════════════════════════════════════════════════╝
                """);
    }
}
