package com.fraudshield.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "action_type")
    private String actionType;

    @Column(name = "actor_type")
    private String actorType;

    @Column(name = "actor_id")
    private String actorId;

    @Column(name = "actor_role")
    private String actorRole;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    @Column(name = "change_reason", length = 2000)
    private String changeReason;

    private LocalDateTime timestamp;
}
