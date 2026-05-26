package com.graphshield.repository;

import com.graphshield.entity.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node, Integer> {

    // Find all nodes in a specific network
    List<Node> findByNetworkId(Integer networkId);

    // Find all compromised nodes
    List<Node> findByIsCompromisedTrue();

    // Find nodes by type (SERVER, ROUTER etc)
    List<Node> findByNodeType(String nodeType);

    // Find nodes with risk level greater than a value
    List<Node> findByRiskLevelGreaterThan(Integer riskLevel);
}