package com.graphshield.algorithms;

import com.graphshield.util.EdgeInfo;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class BFS {

    /**
     * DESIGN PARADIGM: Breadth First Search
     * TIME COMPLEXITY:  O(V + E)
     * SPACE COMPLEXITY: O(V)
     * 
     * USE CASE: Simulates spread attack — attacker infects
     * nodes layer by layer like a worm/virus propagation
     */
    public BFSResult execute(
        Map<Integer, List<EdgeInfo>> graph,
        Integer startNode,
        Integer targetNode
    ) {
        Set<Integer> visited = new LinkedHashSet<>();
        Queue<Integer> queue = new ArrayDeque<>();
        Map<Integer, Integer> parent = new HashMap<>();

        Map<Integer, Integer> level = new HashMap<>();

        // Start from attacker node
        queue.add(startNode);
        visited.add(startNode);
        level.put(startNode, 0);
        parent.put(startNode, -1);

        boolean targetReached = false;

        // BFS main loop
        while (!queue.isEmpty()) {

            // Take front node from queue
            Integer current = queue.poll();

            // Check if we reached the target
            if (current.equals(targetNode)) {
                targetReached = true;
                break;
            }

            // Get all neighbors of current node
            List<EdgeInfo> neighbors = graph.getOrDefault(current, new ArrayList<>());

            for (EdgeInfo neighbor : neighbors) {
                Integer nextNode = neighbor.getTargetId();

                if (!visited.contains(nextNode)) {
                    visited.add(nextNode);
                    queue.add(nextNode);
                    parent.put(nextNode, current);
                    level.put(nextNode, level.get(current) + 1);
                }
            }
        }

        List<Integer> path = reconstructPath(parent, startNode, targetNode);

        return new BFSResult(
            targetReached,
            new ArrayList<>(visited),
            path,
            level
        );
    }

    private List<Integer> reconstructPath(
        Map<Integer, Integer> parent,
        Integer start,
        Integer target
    ) {
        List<Integer> path = new ArrayList<>();

        if (!parent.containsKey(target)) return path;

        Integer current = target;
        while (current != -1) {
            path.add(0, current); // add to front
            current = parent.getOrDefault(current, -1);
        }

        return path;
    }
    public static class BFSResult {
        public boolean targetReached;
        public List<Integer> visitedNodes;  // all nodes BFS touched
        public List<Integer> path;          // shortest hop path
        public Map<Integer, Integer> levels; // which layer each node is at

        public BFSResult(boolean targetReached, List<Integer> visitedNodes,
                        List<Integer> path, Map<Integer, Integer> levels) {
            this.targetReached = targetReached;
            this.visitedNodes = visitedNodes;
            this.path = path;
            this.levels = levels;
        }
    }
}