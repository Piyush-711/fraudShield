"""
Async Kafka consumer for the FraudShield ML service.
Reads from `transactions` topic → runs ML prediction → publishes to `fraud-results` topic.
"""

import asyncio
import json
import logging
import os

from aiokafka import AIOKafkaConsumer, AIOKafkaProducer
from app.services.ml_service import predict, load_model

logger = logging.getLogger("fraudshield.kafka")

KAFKA_BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9092")
CONSUMER_GROUP  = "fraudshield-ml-service"
TOPIC_IN        = "transactions"
TOPIC_OUT       = "fraud-results"
TOPIC_DLQ       = "dead-letter-topic"


async def start_kafka_consumer():
    """Run the async Kafka consumer loop. Call from an asyncio task."""
    logger.info("🎧 Starting Kafka consumer on topic '%s'", TOPIC_IN)

    # Ensure model is loaded
    load_model()

    consumer = AIOKafkaConsumer(
        TOPIC_IN,
        bootstrap_servers=KAFKA_BOOTSTRAP,
        group_id=CONSUMER_GROUP,
        value_deserializer=lambda m: json.loads(m.decode("utf-8")),
        auto_offset_reset="earliest",
        enable_auto_commit=True,
    )
    producer = AIOKafkaProducer(
        bootstrap_servers=KAFKA_BOOTSTRAP,
        value_serializer=lambda v: json.dumps(v).encode("utf-8"),
    )

    await consumer.start()
    await producer.start()
    logger.info("✅ Kafka consumer/producer ready")

    try:
        async for msg in consumer:
            payload = msg.value
            tx_id   = payload.get("transactionId", "unknown")
            try:
                result = predict(payload)
                result["transactionId"] = tx_id
                await producer.send_and_wait(TOPIC_OUT, value=result, key=tx_id.encode())
                logger.info("✅ [Kafka] Processed %s → score=%d prediction=%s",
                            tx_id, result["riskScore"], result["prediction"])
            except Exception as e:
                logger.error("❌ [Kafka] Failed to process %s: %s", tx_id, e)
                dlq_payload = {"originalPayload": payload, "error": str(e)}
                await producer.send_and_wait(TOPIC_DLQ, value=dlq_payload, key=tx_id.encode())
    finally:
        await consumer.stop()
        await producer.stop()
        logger.info("👋 Kafka consumer stopped")
