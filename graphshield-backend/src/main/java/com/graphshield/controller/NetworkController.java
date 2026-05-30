package com.graphshield.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.graphshield.dto.EdgeDTO;
import com.graphshield.dto.NodeDTO;
import com.graphshield.service.NetworkService;

@RestController
@RequestMapping("/api/network")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://cybersecurity-ids-and-attack-path-i.vercel.app",
    "https://graphshield.shrinivas-rj.me"
})
public class NetworkController {

    private final NetworkService networkService;

    public NetworkController(NetworkService networkService) {
        this.networkService = networkService;
    }

    @GetMapping("/nodes")
    public ResponseEntity<List<NodeDTO>> getNodes(
        @RequestParam(defaultValue = "1") Integer networkId
    ) {
        return ResponseEntity.ok(
            networkService.getNodes(networkId)
        );
    }
    @GetMapping("/edges")
    public ResponseEntity<List<EdgeDTO>> getEdges(
        @RequestParam(defaultValue = "1") Integer networkId
    ) {
        return ResponseEntity.ok(
            networkService.getEdges(networkId)
        );
    }
    @PostMapping("/node")
    public ResponseEntity<?> addNode(
        @RequestBody Map<String, Object> body
    ) {
        String nodeName = (String) body.get("nodeName");
        String nodeType = (String) body.get("nodeType");
        String ipAddress = (String) body.get("ipAddress");
        Integer networkId = body.get("networkId") != null
            ? (Integer) body.get("networkId") : 1;

        return ResponseEntity.ok(
            networkService.addNode(
                nodeName, nodeType, ipAddress, networkId
            )
        );
    }

    // POST add a new edge
    @PostMapping("/edge")
    public ResponseEntity<?> addEdge(
        @RequestBody Map<String, Object> body
    ) {
        Integer sourceId = (Integer) body.get("sourceId");
        Integer targetId = (Integer) body.get("targetId");
        Double weight = Double.parseDouble(
            body.get("weight").toString()
        );
        Integer exploitDiff = (Integer) body.get("exploitDiff");
        Integer networkId = body.get("networkId") != null
            ? (Integer) body.get("networkId") : 1;

        return ResponseEntity.ok(
            networkService.addEdge(
                sourceId, targetId,
                weight, exploitDiff, networkId
            )
        );
    }
}