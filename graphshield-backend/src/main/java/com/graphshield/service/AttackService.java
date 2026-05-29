package com.graphshield.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.graphshield.algorithms.ArticulationPoint;
import com.graphshield.algorithms.BFS;
import com.graphshield.algorithms.DFS;
import com.graphshield.algorithms.Dijkstra;
import com.graphshield.algorithms.TarjanSCC;
import com.graphshield.dto.AnalysisResultDTO;
import com.graphshield.dto.AttackRequestDTO;
import com.graphshield.entity.Alert;
import com.graphshield.entity.AttackSession;
import com.graphshield.repository.AlertRepository;
import com.graphshield.repository.AttackSessionRepository;
import com.graphshield.util.EdgeInfo;
import com.graphshield.util.GraphBuilder;

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
    private final JdbcTemplate jdbcTemplate;

    public AttackService(
        GraphBuilder graphBuilder,
        BFS bfs,
        DFS dfs,
        Dijkstra dijkstra,
        ArticulationPoint articulationPoint,
        TarjanSCC tarjanSCC,
        AttackSessionRepository sessionRepository,
        AlertRepository alertRepository,
        JdbcTemplate jdbcTemplate
    ) {
        this.graphBuilder = graphBuilder;
        this.bfs = bfs;
        this.dfs = dfs;
        this.dijkstra = dijkstra;
        this.articulationPoint = articulationPoint;
        this.tarjanSCC = tarjanSCC;
        this.sessionRepository = sessionRepository;
        this.alertRepository = alertRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public AnalysisResultDTO simulateAttack(AttackRequestDTO request) {

        Integer networkId = request.getNetworkId() != null ? request.getNetworkId() : 1;
        Integer attackerNode = request.getAttackerNodeId();
        Integer targetNode = request.getTargetNodeId();
        String attackType = request.getAttackType();

        Map<Integer, List<EdgeInfo>> graph = graphBuilder.buildGraph(networkId);

        AttackSession session = new AttackSession();
        session.setAttackerNode(attackerNode);
        session.setTargetNode(targetNode);
        session.setAttackType(attackType);
        session.setStatus("RUNNING");
        session.setRiskBefore(calculateGraphRiskScore(graph));
        session = sessionRepository.save(session);

        logAttackEvent(
            session.getSessionId(),
            "ATTACK_STARTED",
            attackerNode,
            targetNode,
            "Attack simulation started from Node " + attackerNode +
            " targeting Node " + targetNode +
            " using " + attackType
        );

        BFS.BFSResult bfsResult = bfs.execute(graph, attackerNode, targetNode);
        Dijkstra.DijkstraResult dijkstraResult = dijkstra.execute(graph, attackerNode, targetNode);
        DFS.DFSResult dfsResult = dfs.execute(graph, attackerNode, targetNode);
        ArticulationPoint.APResult apResult = articulationPoint.execute(graph);
        TarjanSCC.SCCResult sccResult = tarjanSCC.execute(graph);

        List<Integer> primaryPath = getPrimaryAttackPath(attackType, bfsResult, dijkstraResult, dfsResult);

        saveAttackPathLogs(session.getSessionId(), primaryPath);

        if (bfsResult.targetReached) {
            generateAlerts(session.getSessionId(), targetNode, graph);

            logAttackEvent(
                session.getSessionId(),
                "TARGET_REACHED",
                attackerNode,
                targetNode,
                "Target Node " + targetNode + " was successfully reached by attacker"
            );
        } else {
            logAttackEvent(
                session.getSessionId(),
                "ATTACK_BLOCKED",
                attackerNode,
                targetNode,
                "Attack was blocked before reaching Target Node " + targetNode
            );
        }

        int dynamicRisk = calculateDynamicRiskScore(bfsResult, dijkstraResult, dfsResult);

        session.setRiskAfter(dynamicRisk);
        session.setStatus(bfsResult.targetReached ? "COMPLETED" : "BLOCKED");
        sessionRepository.save(session);

        List<String> recommendations = generateRecommendations(bfsResult, dijkstraResult, apResult);

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

    private void logAttackEvent(
        Integer sessionId,
        String eventType,
        Integer sourceNode,
        Integer targetNode,
        String message
    ) {
        jdbcTemplate.update(
            """
            INSERT INTO attack_event_log
            (session_id, event_type, source_node, target_node, message)
            VALUES (?, ?, ?, ?, ?)
            """,
            sessionId,
            eventType,
            sourceNode,
            targetNode,
            message
        );
    }

    private void saveAttackPathLogs(Integer sessionId, List<Integer> path) {
        if (path == null || path.isEmpty()) {
            logAttackEvent(
                sessionId,
                "NO_PATH_FOUND",
                null,
                null,
                "No valid attack path found between attacker and target"
            );
            return;
        }

        for (int i = 0; i < path.size(); i++) {
            Integer current = path.get(i);

            logAttackEvent(
                sessionId,
                "NODE_VISITED",
                current,
                null,
                "Attacker reached Node " + current
            );

            if (i < path.size() - 1) {
                Integer next = path.get(i + 1);

                logAttackEvent(
                    sessionId,
                    "EDGE_TRAVERSED",
                    current,
                    next,
                    "Attacker moved from Node " + current + " to Node " + next
                );
            }
        }
    }

    private List<Integer> getPrimaryAttackPath(
        String attackType,
        BFS.BFSResult bfsResult,
        Dijkstra.DijkstraResult dijkstraResult,
        DFS.DFSResult dfsResult
    ) {
        if ("DIJKSTRA".equalsIgnoreCase(attackType) || "DIJKSTRA_ATTACK".equalsIgnoreCase(attackType)) {
            return dijkstraResult.easiestPath != null ? dijkstraResult.easiestPath : new ArrayList<>();
        }

        if ("DFS".equalsIgnoreCase(attackType) || "DFS_ATTACK".equalsIgnoreCase(attackType)) {
            if (dfsResult.allPaths != null && !dfsResult.allPaths.isEmpty()) {
                return dfsResult.allPaths.get(0);
            }
            return new ArrayList<>();
        }

        return bfsResult.path != null ? bfsResult.path : new ArrayList<>();
    }

    private Integer calculateGraphRiskScore(Map<Integer, List<EdgeInfo>> graph) {
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

    private Integer calculateDynamicRiskScore(
        BFS.BFSResult bfsResult,
        Dijkstra.DijkstraResult dijkstraResult,
        DFS.DFSResult dfsResult
    ) {
        if (!bfsResult.targetReached) return 10;

        int score = 0;

        if (bfsResult.path != null && !bfsResult.path.isEmpty()) {
            int hops = bfsResult.path.size();
            score += Math.max(0, 40 - (hops * 5));
        }

        if (dijkstraResult.totalCost > 0) {
            int costScore = (int) Math.max(0, 30 - (dijkstraResult.totalCost * 10));
            score += costScore;
        }

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
        alert.setMessage("Target node " + targetNode + " is reachable by attacker!");
        alertRepository.save(alert);
    }

    private List<String> generateRecommendations(
        BFS.BFSResult bfsResult,
        Dijkstra.DijkstraResult dijkstraResult,
        ArticulationPoint.APResult apResult
    ) {
        List<String> recommendations = new ArrayList<>();

        if (bfsResult.targetReached) {
            recommendations.add("🚨 CRITICAL: Attack path exists! Immediate action required.");
        }

        if (!dijkstraResult.easiestPath.isEmpty()) {
            recommendations.add(
                "⚠️ Easiest attack path has " +
                dijkstraResult.easiestPath.size() +
                " hops. Consider adding firewall between nodes: " +
                dijkstraResult.easiestPath
            );
        }

        if (!apResult.criticalNodes.isEmpty()) {
            recommendations.add(
                "🔴 Critical nodes detected: " +
                apResult.criticalNodes +
                ". These nodes must be heavily monitored."
            );
        }

        if (recommendations.isEmpty()) {
            recommendations.add("✅ No direct attack path found. Network appears secure.");
        }

        return recommendations;
    }
}