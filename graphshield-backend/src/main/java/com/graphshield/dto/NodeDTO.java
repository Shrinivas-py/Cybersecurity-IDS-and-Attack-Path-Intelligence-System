package com.graphshield.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

// Simplified node info sent to frontend
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NodeDTO {
    private Integer nodeId;
    private String nodeName;
    private String nodeType;
    private String ipAddress;
    private Integer riskLevel;
    private Boolean isCompromised;
}