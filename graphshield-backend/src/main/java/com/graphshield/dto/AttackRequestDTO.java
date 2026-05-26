package com.graphshield.dto;

import lombok.Data;

@Data
public class AttackRequestDTO {
    private Integer attackerNodeId;  // which node is the attacker
    private Integer targetNodeId;    // which node is the target
    private String attackType;       // SHORTEST_PATH, SPREAD, BRUTE_FORCE
    private Integer networkId;       // which network (default 1)
}