package com.graphshield.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "attack_session")
public class AttackSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @Column(name = "attacker_node")
    private Integer attackerNode;

    @Column(name = "target_node")
    private Integer targetNode;

    @Column(name = "attack_type")
    private String attackType = "SHORTEST_PATH";

    @Column(name = "started_at")
    private LocalDateTime startedAt = LocalDateTime.now();

    @Column(name = "status")
    private String status = "RUNNING";

    @Column(name = "risk_before")
    private Integer riskBefore;

    @Column(name = "risk_after")
    private Integer riskAfter;
}