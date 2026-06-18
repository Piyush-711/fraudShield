package com.fraudshield.repository;

import com.fraudshield.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientIdOrderByCreatedAtDesc(Long recipientId);
    List<Notification> findByStatusOrderByCreatedAtDesc(String status);
    long countByStatus(String status);
}
