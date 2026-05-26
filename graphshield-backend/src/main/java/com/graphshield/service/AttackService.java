package com.graphshield.service;

import com.graphshield.algorithms.*;
import com.graphshield.dto.AnalysisResultDTO;
import com.graphshield.dto.AttackRequestDTO;
import com.graphshield.entity.Alert;
import com.graphshield.entity.AttackSession;
import com.graphshield.repository.AlertRepository;
import com.graphshield.repository.AttackSessionRepository;
import com.graphshield.util.EdgeInfo;
import com.graphshield.util.GraphBuilder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AttackService {

    private final GraphBuilder graphBuilder;
    private final BFS bfs;
    private final DFS dfs;
    private final Dijkstra dijkstra;
    private final ArticulationPoint articulationPoint;
    private final TarjanSCC tarjanSCC;
    private final AttackSessionRepository sessionRepository;
    private final AlertRepository alertRepository;

    public AttackService(
        GraphBuilder graphBuilder, BFS bfs, DFS dfs,
        Dijkstra dijkstra, ArticulationPoint articulationPoint,
        TarjanSCC tarjanSCC,
        AttackSessionRepository sessionRepository,
        AlertRepository alertRepository
    ) {
        this.graphBuilder = graphBuilder;
        this.bfs = bfs;
        this.dfs = dfs;
        this.dijkstra = dijkstra;
        this.articulationPoint = articulationPoint;
        this.tarjanSCC = tarjanSCC;
        this.sessionRepository = sessionRepository;
        this.alertRepository = alertRepository;
    }

    public AnalysisResultDTO simulateAttack(AttackRequestDTO request) {

        Integer networkId = request.getNetworkId() != null
                           ? request.getNetworkId() : 1;
        Integer attackerNode = request.getAttackerNodeId();
        Integer targetNode = request.getTargetNodeId();
        String attackType = request.getAttackType();

        // Step 1: Load graph from DB into memory
        Map<Integer, List<EdgeInfo>> graph =
            graphBuilder.buildGraph(networkId);

        // Step 2: Save attack session to DB
        AttackSession session = new AttackSession();
        session.setAttackerNode(attackerNode);
        session.setTargetNode(targetNode);
        session.setAttackType(attackType);
        session.setStatus("RUNNING");
        session.setRiskBefore(calculateGraphRiskScore(graph)); // static graph-based
        session = sessionRepository.save(session);

        // Step 3: Run all algorithms
        BFS.BFSResult bfsResult = bfs.execute(
            graph, attackerNode, targetNode
        );
        Dijkstra.DijkstraResult dijkstraResult = dijkstra.execute(
            graph, attackerNode, targetNode
        );
        DFS.DFSResult dfsResult = dfs.execute(
            graph, attackerNode, targetNode
        );
        ArticulationPoint.APResult apResult =
            articulationPoint.execute(graph);
        TarjanSCC.SCCResult sccResult = tarjanSCC.execute(graph);

        // Step 4: Generate alerts if target reached
        if (bfsResult.targetReached) {
            generateAlerts(session.getSessionId(), targetNode, graph);
        }

        // Step 5: Calculate dynamic risk score based on actual results
        int dynamicRisk = calculateDynamicRiskScore(
            bfsResult, dijkstraResult, dfsResult
        );

        // Step 6: Update session with final status and risk
        session.setRiskAfter(dynamicRisk);
        session.setStatus(bfsResult.targetReached ? "COMPLETED" : "BLOCKED");
        sessionRepository.save(session);

        // Step 7: Build recommendations
        List<String> recommendations = generateRecommendations(
            bfsResult, dijkstraResult, apResult
        );

        // Step 8: Build and return result DTO
        AnalysisResultDTO result = new AnalysisResultDTO();
        result.setSessionId(session.getSessionId());
        result.setAttackType(attackType);
        result.setTargetReached(bfsResult.targetReached);
        result.setBfsVisitedNodes(bfsResult.visitedNodes);
        result.setBfsPath(bfsResult.path);
        result.setBfsLevels(bfsResult.levels);
        result.setEasiestPath(dijkstraResult.easiestPath);
        result.setTotalAttackCost(dijkstraResult.totalCost);
        result.setAllAttackPaths(dfsResult.allPaths);
        result.setHasCycle(dfsResult.hasCycle);
        result.setCriticalNodes(apResult.criticalNodes);
        result.setStronglyConnectedComponents(sccResult.components);
        result.setRiskScore(dynamicRisk);
        result.setRecommendations(recommendations);

        return result;
    }

    // Static graph-based risk — used for riskBefore (before attack runs)
    private Integer calculateGraphRiskScore(
        Map<Integer, List<EdgeInfo>> graph
    ) {
        int totalEdges = 0;
        int totalWeight = 0;
        for (List<EdgeInfo> edges : graph.values()) {
            for (EdgeInfo e : edges) {
                totalEdges++;
                totalWeight += (e.getWeight() * 100);
            }
        }
        if (totalEdges == 0) return 0;
        return Math.min(100, totalWeight / totalEdges);
    }

    // Dynamic risk — based on actual attack path results
    private Integer calculateDynamicRiskScore(
        BFS.BFSResult bfsResult,
        Dijkstra.DijkstraResult dijkstraResult,
        DFS.DFSResult dfsResult
    ) {
        if (!bfsResult.targetReached) return 10;

        int score = 0;

        // Factor 1: BFS path length — shorter path = higher risk
        if (bfsResult.path != null && !bfsResult.path.isEmpty()) {
            int hops = bfsResult.path.size();
            score += Math.max(0, 40 - (hops * 5));
        }

        // Factor 2: Dijkstra cost — lower cost = easier attack = higher risk
        if (dijkstraResult.totalCost > 0) {
            int costScore = (int) Math.max(0, 30 - (dijkstraResult.totalCost * 10));
            score += costScore;
        }

        // Factor 3: DFS paths — more paths = more attack surface = higher risk
        if (dfsResult.allPaths != null) {
            int pathScore = Math.min(30, dfsResult.allPaths.size() * 3);
            score += pathScore;
        }

        return Math.min(100, Math.max(10, score));
    }

    private void generateAlerts(
        Integer sessionId,
        Integer targetNode,
        Map<Integer, List<EdgeInfo>> graph
    ) {
        Alert alert = new Alert();
        alert.setSessionId(sessionId);
        alert.setNodeId(targetNode);
        alert.setSeverity("CRITICAL");
        alert.setMessage("Target node " + targetNode +
                        " is reachable by attacker!");
        alertRepository.save(alert);
    }

    private List<String> generateRecommendations(
        BFS.BFSResult bfsResult,
        Dijkstra.DijkstraResult dijkstraResult,
        ArticulationPoint.APResult apResult
    ) {
        List<String> recommendations = new ArrayList<>();

        if (bfsResult.targetReached) {
            recommendations.add(
                "🚨 CRITICAL: Attack path exists! " +
                "Immediate action required."
            );
        }

        if (!dijkstraResult.easiestPath.isEmpty()) {
            recommendations.add(
                "⚠️ Easiest attack path has " +
                dijkstraResult.easiestPath.size() +
                " hops. Consider adding firewall between nodes: " +
                dijkstraResult.easiestPath.toString()
            );
        }

        if (!apResult.criticalNodes.isEmpty()) {
            recommendations.add(
                "🔴 Critical nodes detected: " +
                apResult.criticalNodes.toString() +
                ". These nodes must be heavily monitored."
            );
        }

        if (recommendations.isEmpty()) {
            recommendations.add(
                "✅ No direct attack path found. Network appears secure."
            );
        }

        return recommendations;
    }
}