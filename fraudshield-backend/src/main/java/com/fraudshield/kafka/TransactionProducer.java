package com.fraudshield.kafka;

import com.fraudshield.config.KafkaProducerConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.CompletableFuture;

/**
 * Publishes transaction and audit events to Kafka topics.
 * Only active in the 'prod' profile (when Kafka is available).
 */
@Service
@Profile("prod")
@RequiredArgsConstructor
@Slf4j
public class TransactionProducer {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Publishes a full transaction payload to the `transactions` topic.
     * The Python ML service consumes from this topic for async processing.
     *
     * @param transactionId   unique key for partitioning
     * @param transactionPayload serializable event object (Map or DTO)
     */
    public void publishTransaction(String transactionId, Map<String, Object> transactionPayload) {
        CompletableFuture<SendResult<String, Object>> future =
            kafkaTemplate.send(KafkaProducerConfig.TOPIC_TRANSACTIONS, transactionId, transactionPayload);

        future.whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("❌ Failed to publish transaction {} to Kafka: {}", transactionId, ex.getMessage());
                // In production: route to dead-letter topic
                publishToDeadLetter(transactionId, transactionPayload, ex.getMessage());
            } else {
                log.debug("✅ Transaction {} published to Kafka partition {} offset {}",
                    transactionId,
                    result.getRecordMetadata().partition(),
                    result.getRecordMetadata().offset());
            }
        });
    }

    /**
     * Publishes an audit event to the `audit-events` topic.
     */
    public void publishAuditEvent(String transactionId, Map<String, Object> auditPayload) {
        kafkaTemplate.send(KafkaProducerConfig.TOPIC_AUDIT_EVENTS, transactionId, auditPayload)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("❌ Failed to publish audit event for transaction {}: {}", transactionId, ex.getMessage());
                }
            });
    }

    /**
     * Publishes a fraud alert to the `fraud-alerts` topic for notification service consumption.
     */
    public void publishFraudAlert(String transactionId, Map<String, Object> alertPayload) {
        kafkaTemplate.send(KafkaProducerConfig.TOPIC_ALERTS, transactionId, alertPayload)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("❌ Failed to publish fraud alert for transaction {}: {}", transactionId, ex.getMessage());
                }
            });
    }

    private void publishToDeadLetter(String key, Object payload, String errorReason) {
        try {
            kafkaTemplate.send(KafkaProducerConfig.TOPIC_DEAD_LETTER, key,
                Map.of("originalPayload", payload, "error", errorReason, "timestamp", System.currentTimeMillis()));
        } catch (Exception e) {
            log.error("💀 Failed to send to dead-letter topic: {}", e.getMessage());
        }
    }
}
