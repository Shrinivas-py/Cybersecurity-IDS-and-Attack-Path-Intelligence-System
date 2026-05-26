package com.graphshield.service;

import com.graphshield.algorithms.Dijkstra;
import com.graphshield.dto.AnalysisResultDTO;
import com.graphshield.dto.RemediationDTO;
import com.graphshield.algorithms.BFS;
import com.graphshield.repository.AttackSessionRepository;
import com.graphshield.entity.AttackSession;
import com.graphshield.util.EdgeInfo;
import com.graphshield.util.GraphBuilder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
public class RemediationService {

    private final GraphBuilder graphBuilder;
    private final BFS bfs;
    private final Dijkstra dijkstra;
    private final AttackSessionRepository sessionRepository;

    public RemediationService(
        GraphBuilder graphBuilder, BFS bfs,
        Dijkstra dijkstra,
        AttackSessionRepository sessionRepository
    ) {
        this.graphBuilder = graphBuilder;
        this.bfs = bfs;
        this.dijkstra = dijkstra;
        this.sessionRepository = sessionRepository;
    }

    public AnalysisResultDTO applyRemediation(
        RemediationDTO request
    ) {
        Integer networkId = request.getNetworkId() != null
                           ? request.getNetworkId() : 1;

        // Step 1: Load fresh graph from DB
        Map<Integer, List<EdgeInfo>> graph =
            graphBuilder.buildGraph(networkId);

        // Step 2: Apply the fix IN MEMORY ONLY
        if ("REMOVE_EDGE".equals(request.getActionType())) {
            graphBuilder.removeEdgeFromGraph(
                graph,
                request.getSourceNodeId(),
                request.getTargetNodeId()
            );
        } else if ("ISOLATE_NODE".equals(
                   request.getActionType())) {
            graphBuilder.isolateNode(
                graph, request.getNodeId()
            );
        }

        // Step 3: Get session to know attacker/target
        AttackSession session = sessionRepository.findById(request.getSessionId() != null ? request.getSessionId() : 0)
            .orElseThrow(() ->
                new RuntimeException("Session not found"));

        // Step 4: Rerun algorithms on MODIFIED graph
        BFS.BFSResult newBfsResult = bfs.execute(
            graph,
            session.getAttackerNode(),
            session.getTargetNode()
        );
        Dijkstra.DijkstraResult newDijkstraResult =
            dijkstra.execute(
                graph,
                session.getAttackerNode(),
                session.getTargetNode()
            );

        // Step 5: Update session risk_after
        session.setRiskAfter(
            newBfsResult.targetReached ? 70 : 10
        );
        session.setStatus(
            newBfsResult.targetReached
            ? "COMPLETED" : "BLOCKED"
        );
        sessionRepository.save(session);

        // Step 6: Return new analysis result
        AnalysisResultDTO result = new AnalysisResultDTO();
        result.setSessionId(request.getSessionId());
        result.setTargetReached(newBfsResult.targetReached);
        result.setBfsVisitedNodes(newBfsResult.visitedNodes);
        result.setBfsPath(newBfsResult.path);
        result.setEasiestPath(newDijkstraResult.easiestPath);
        result.setTotalAttackCost(
            newDijkstraResult.totalCost
        );

        List<String> recommendations = new ArrayList<>();
        if (!newBfsResult.targetReached) {
            recommendations.add(
                "✅ Remediation successful! " +
                "Attack path has been blocked."
            );
            recommendations.add(
                "Risk reduced from " +
                session.getRiskBefore() +
                " to " + session.getRiskAfter()
            );
        } else {
            recommendations.add(
                "⚠️ Attack path still exists. " +
                "Consider additional remediation."
            );
        }
        result.setRecommendations(recommendations);

        return result;
    }
}