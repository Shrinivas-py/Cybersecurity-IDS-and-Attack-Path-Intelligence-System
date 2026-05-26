package com.graphshield.repository;

import com.graphshield.entity.AttackSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AttackSessionRepository extends JpaRepository<AttackSession, Integer> {

    // Get all sessions by status
    List<AttackSession> findByStatus(String status);

    // Get all sessions for a specific attacker node
    List<AttackSession> findByAttackerNode(Integer attackerNode);
}