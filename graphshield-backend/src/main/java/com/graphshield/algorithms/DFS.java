package com.graphshield.algorithms;

import com.graphshield.util.EdgeInfo;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DFS {

    /**
     * DESIGN PARADIGM: Depth First Search + Backtracking
     * TIME COMPLEXITY:  O(V + E) for basic DFS
     *                   O(V!) worst case for all paths
     * SPACE COMPLEXITY: O(V) for recursion stack
     *
     * USE CASE 1: Find ALL possible attack paths (backtracking)
     * USE CASE 2: Cycle detection in network
     */
    private List<List<Integer>> allPaths = new ArrayList<>();

    public DFSResult execute(
        Map<Integer, List<EdgeInfo>> graph,
        Integer startNode,
        Integer targetNode
    ) {
        allPaths = new ArrayList<>();
        Set<Integer> visited = new LinkedHashSet<>();
        List<Integer> currentPath = new ArrayList<>();
        boolean[] hasCycle = {false};

        // Start DFS
        dfsHelper(graph, startNode, targetNode,
                  visited, currentPath, hasCycle);

        return new DFSResult(allPaths, hasCycle[0]);
    }

    private void dfsHelper(
        Map<Integer, List<EdgeInfo>> graph,
        Integer current,
        Integer target,
        Set<Integer> visited,
        List<Integer> currentPath,
        boolean[] hasCycle
    ) {
        // Mark current node as visited
        visited.add(current);
        currentPath.add(current);

        // If we reached target, save this path
        if (current.equals(target)) {
            allPaths.add(new ArrayList<>(currentPath));
        } else {
            // Explore all neighbors
            List<EdgeInfo> neighbors = graph.getOrDefault(
                current, new ArrayList<>()
            );

            for (EdgeInfo neighbor : neighbors) {
                Integer next = neighbor.getTargetId();

                if (!visited.contains(next)) {
                    // Go deeper
                    dfsHelper(graph, next, target,
                              visited, currentPath, hasCycle);
                } else if (currentPath.contains(next)) {
                    // We found a cycle!
                    hasCycle[0] = true;
                }
            }
        }

        // BACKTRACK
        currentPath.remove(currentPath.size() - 1);
        visited.remove(current);
    }

    public static class DFSResult {
        public List<List<Integer>> allPaths;
        public boolean hasCycle;
        public int totalPathsFound;

        public DFSResult(List<List<Integer>> allPaths, boolean hasCycle) {
            this.allPaths = allPaths;
            this.hasCycle = hasCycle;
            this.totalPathsFound = allPaths.size();
        }
    }
}