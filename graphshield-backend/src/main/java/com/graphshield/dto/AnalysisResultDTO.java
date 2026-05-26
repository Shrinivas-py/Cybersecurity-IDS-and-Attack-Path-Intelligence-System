package com.graphshield.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.Map;

// This is what backend sends BACK to frontend
// Contains all algorithm results
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResultDTO {
    private Integer sessionId;
    private String attackType;
    private boolean targetReached;

    private List<Integer> bfsVisitedNodes;
    private List<Integer> bfsPath;
    private Map<Integer, Integer> bfsLevels;

    private List<Integer> easiestPath;
    private Double totalAttackCost;

    private List<List<Integer>> allAttackPaths;
    private boolean hasCycle;

    private List<Integer> criticalNodes;

    private List<List<Integer>> stronglyConnectedComponents;


    private Integer riskScore;
    private List<String> recommendations;
}