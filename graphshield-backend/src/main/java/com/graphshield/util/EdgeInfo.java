package com.graphshield.util;

import lombok.AllArgsConstructor;
import lombok.Data;

// Represents one edge in our in-memory graph
// we store it as EdgeInfo(targetId=2, weight=0.3)

@Data
@AllArgsConstructor
public class EdgeInfo {
    private Integer targetId;    // where this edge goes
    private Double weight;       // how easy to exploit (lower = easier)
    private Integer exploitDiff; // difficulty score 1-10
    private Integer edgeId;      // original DB edge id (needed for remediation)
}