package com.graphshield.dto;

import lombok.Data;

// when user wants to approve fixes!
@Data
public class RemediationDTO {
    private Integer sessionId;
    private String actionType;    // REMOVE_EDGE, ISOLATE_NODE
    private Integer sourceNodeId; // for REMOVE_EDGE
    private Integer targetNodeId; // for REMOVE_EDGE
    private Integer nodeId;       // for ISOLATE_NODE
    private Integer networkId;
}