package com.graphshield.repository;

import com.graphshield.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Integer> {
    List<Alert> findBySessionId(Integer sessionId); // SELECT FROM DB WHERE = SESSION_ID = "";
    List<Alert> findBySeverity(String severity);
    List<Alert> findByNodeId(Integer nodeId);
}