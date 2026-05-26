package com.graphshield.algorithms;

import com.graphshield.util.EdgeInfo;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ArticulationPoint {

    /**
     * DESIGN PARADIGM: DFS based (Tarjan's AP algorithm)
     *
     * USE CASE: Find critical nodes — if removed, network
     * breaks into disconnected components
     * These nodes need maximum protection
     */

    private int timer;

    public APResult execute(Map<Integer, List<EdgeInfo>> graph) {

        Set<Integer> articulationPoints = new HashSet<>();
        Map<Integer, Integer> discoveryTime = new HashMap<>();
        Map<Integer, Integer> low = new HashMap<>();
        Map<Integer, Boolean> visited = new HashMap<>();
        Map<Integer, Integer> parent = new HashMap<>();

        timer = 0;

        // Initialize
        for (Integer node : graph.keySet()) {
            visited.put(node, false);
            parent.put(node, -1);
        }

        // Run DFS from each unvisited node
        for (Integer node : graph.keySet()) {
            if (!visited.get(node)) {
                dfs(graph, node, visited, discoveryTime,
                    low, parent, articulationPoints);
            }
        }

        return new APResult(new ArrayList<>(articulationPoints));
    }

    private void dfs(
        Map<Integer, List<EdgeInfo>> graph,
        Integer u,
        Map<Integer, Boolean> visited,
        Map<Integer, Integer> disc,
        Map<Integer, Integer> low,
        Map<Integer, Integer> parent,
        Set<Integer> articulationPoints
    ) {
        int children = 0;
        visited.put(u, true);
        disc.put(u, timer);
        low.put(u, timer);
        timer++;

        List<EdgeInfo> neighbors = graph.getOrDefault(
            u, new ArrayList<>()
        );

        for (EdgeInfo edge : neighbors) {
            Integer v = edge.getTargetId();

            if (!visited.getOrDefault(v, false)) {
                children++;
                parent.put(v, u);
                dfs(graph, v, visited, disc, low,
                    parent, articulationPoints);

                // Update low value
                low.put(u, Math.min(low.get(u), low.get(v)));

                // u is AP if it's root with 2+ children
                if (parent.get(u) == -1 && children > 1) {
                    articulationPoints.add(u);
                }

                // u is AP if low[v] >= disc[u]
                if (parent.get(u) != -1
                    && low.get(v) >= disc.get(u)) {
                    articulationPoints.add(u);
                }

            } else if (!v.equals(parent.get(u))) {
                low.put(u, Math.min(low.get(u), disc.get(v)));
            }
        }
    }

    public static class APResult {
        public List<Integer> criticalNodes;
        public int count;

        public APResult(List<Integer> criticalNodes) {
            this.criticalNodes = criticalNodes;
            this.count = criticalNodes.size();
        }
    }
}