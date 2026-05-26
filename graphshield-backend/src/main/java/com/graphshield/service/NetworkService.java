package com.graphshield.service;

import com.graphshield.dto.EdgeDTO;
import com.graphshield.dto.NodeDTO;
import com.graphshield.entity.Edge;
import com.graphshield.entity.Node;
import com.graphshield.repository.EdgeRepository;
import com.graphshield.repository.NodeRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NetworkService {

    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;

    public NetworkService(NodeRepository nodeRepository,EdgeRepository edgeRepository) {
        this.nodeRepository = nodeRepository;
        this.edgeRepository = edgeRepository;
    }
    public List<NodeDTO> getNodes(Integer networkId) {
        List<Node> nodes = nodeRepository.findByNetworkId(networkId);
        return nodes.stream()
            .map(this::convertToNodeDTO)
            .collect(Collectors.toList());
    }

    public List<EdgeDTO> getEdges(Integer networkId) {
        List<Edge> edges = edgeRepository.findByNetworkId(networkId);
        return edges.stream()
            .map(this::convertToEdgeDTO)
            .collect(Collectors.toList());
    }
    public Node addNode(String nodeName, String nodeType,String ipAddress, Integer networkId) {
        Node node = new Node();
        node.setNodeName(nodeName);
        node.setNodeType(nodeType);
        node.setIpAddress(ipAddress);
        node.setNetworkId(networkId);
        node.setRiskLevel(0);
        node.setIsCompromised(false);
        return nodeRepository.save(node);
    }
    public Edge addEdge(Integer sourceId, Integer targetId,
                        Double weight, Integer exploitDiff,
                        Integer networkId) {
        Edge edge = new Edge();
        edge.setSourceId(sourceId);
        edge.setTargetId(targetId);
        edge.setWeight(new java.math.BigDecimal(weight));
        edge.setExploitDiff(exploitDiff);
        edge.setNetworkId(networkId);
        edge.setIsActive(true);
        return edgeRepository.save(edge);
    }

    private NodeDTO convertToNodeDTO(Node node) {
        return new NodeDTO(
            node.getNodeId(),
            node.getNodeName(),
            node.getNodeType(),
            node.getIpAddress(),
            node.getRiskLevel(),
            node.getIsCompromised()
        );
    }

    // Convert Edge entity to EdgeDTO
    private EdgeDTO convertToEdgeDTO(Edge edge) {
        return new EdgeDTO(
            edge.getEdgeId(),
            edge.getSourceId(),
            edge.getTargetId(),
            edge.getWeight(),
            edge.getExploitDiff(),
            edge.getIsActive()
        );
    }
}