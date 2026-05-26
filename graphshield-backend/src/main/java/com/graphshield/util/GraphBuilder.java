package com.graphshield.util;

import com.graphshield.entity.Edge;
import com.graphshield.entity.Node;
import com.graphshield.repository.EdgeRepository;
import com.graphshield.repository.NodeRepository;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component  // Spring will manage this class automatically
public class GraphBuilder {

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;

    // Constructor injection — Spring automatically provides repositories
    public GraphBuilder(NodeRepository nodeRepository, EdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }

    /**
     * Loads the network from DB into memory as adjacency list
     * 
     * Returns: HashMap where
     *   key   = source node ID
     *   value = list of EdgeInfo (target, weight, difficulty)
     * 
     */
    public Map<Integer, List<EdgeInfo>> buildGraph(Integer networkId) {

        // Step 1: Get all active edges for this network from DB
        List<Edge> edges = edgeRepository.findByNetworkIdAndIsActiveTrue(networkId);

        // Step 2: Create empty adjacency list
        // HashMap<sourceNodeId, List of edges going out from it>
        Map<Integer, List<EdgeInfo>> adjacencyList = new HashMap<>();

        // Step 3: Get all nodes and initialize empty lists for each
        List<Node> nodes = nodeRepository.findByNetworkId(networkId);
        for (Node node : nodes) {
            adjacencyList.put(node.getNodeId(), new ArrayList<>());
        }

        // Step 4: Fill adjacency list with edges
        for (Edge edge : edges) {
            Integer sourceId = edge.getSourceId();
            Integer targetId = edge.getTargetId();
            Double weight = edge.getWeight().doubleValue();
            Integer exploitDiff = edge.getExploitDiff();
            Integer edgeId = edge.getEdgeId();

            // Add this edge to the source node's list
            adjacencyList.get(sourceId).add(
                new EdgeInfo(targetId, weight, exploitDiff, edgeId)
            );
        }

        return adjacencyList;
    }

    /**
     * Returns list of all nodes in a network
     * Algorithms need this to know which nodes exist
     */
    public List<Node> getNodes(Integer networkId) {
        return nodeRepository.findByNetworkId(networkId);
    }

    /**
     * Removes an edge from the IN-MEMORY graph only
     * Used during remediation simulation
     * Does NOT touch the database
     */
    public void removeEdgeFromGraph(
        Map<Integer, List<EdgeInfo>> graph,
        Integer sourceId,
        Integer targetId
    ) {
        List<EdgeInfo> edges = graph.get(sourceId);
        if (edges != null) {
            edges.removeIf(e -> e.getTargetId().equals(targetId));
        }
    }

    /**
     * Isolates a node by removing all edges going INTO it
     * Used during remediation — like disconnecting a compromised server
     * Does NOT touch the database
     */
    public void isolateNode(
        Map<Integer, List<EdgeInfo>> graph,
        Integer nodeId
    ) {
        // Remove all outgoing edges from this node
        graph.put(nodeId, new ArrayList<>());

        // Remove all incoming edges to this node
        for (List<EdgeInfo> edgeList : graph.values()) {
            edgeList.removeIf(e -> e.getTargetId().equals(nodeId));
        }
    }
}