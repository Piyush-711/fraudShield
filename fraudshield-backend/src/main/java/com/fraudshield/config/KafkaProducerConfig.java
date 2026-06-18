package com.fraudshield.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;

@Configuration
@Profile("prod")
public class KafkaProducerConfig {

    // ─── Topic names ───────────────────────────────────────────────────────────
    public static final String TOPIC_TRANSACTIONS = "transactions";
    public static final String TOPIC_FRAUD_RESULTS = "fraud-results";
    public static final String TOPIC_AUDIT_EVENTS  = "audit-events";
    public static final String TOPIC_ALERTS        = "fraud-alerts";
    public static final String TOPIC_DEAD_LETTER   = "dead-letter-topic";

    // ─── Auto-create topics on startup ─────────────────────────────────────────
    @Bean
    public NewTopic transactionsTopic() {
        return TopicBuilder.name(TOPIC_TRANSACTIONS).partitions(10).replicas(1).build();
    }

    @Bean
    public NewTopic fraudResultsTopic() {
        return TopicBuilder.name(TOPIC_FRAUD_RESULTS).partitions(10).replicas(1).build();
    }

    @Bean
    public NewTopic auditEventsTopic() {
        return TopicBuilder.name(TOPIC_AUDIT_EVENTS).partitions(5).replicas(1).build();
    }

    @Bean
    public NewTopic alertsTopic() {
        return TopicBuilder.name(TOPIC_ALERTS).partitions(3).replicas(1).build();
    }

    @Bean
    public NewTopic deadLetterTopic() {
        return TopicBuilder.name(TOPIC_DEAD_LETTER).partitions(3).replicas(1).build();
    }

    // ─── KafkaTemplate ─────────────────────────────────────────────────────────
    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate(ProducerFactory<String, Object> factory) {
        return new KafkaTemplate<>(factory);
    }
}
