package com.graphshield.algorithms;

import com.graphshield.util.EdgeInfo;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class Dijkstra {
    public DijkstraResult execute(
        Map<Integer, List<EdgeInfo>> graph,
        Integer startNode,
        Integer targetNode
    ) {
        // Distance map — stores minimum cost to reach each node
        Map<Integer, Double> distance = new HashMap<>();

        // Parent map — to reconstruct the path
        Map<Integer, Integer> parent = new HashMap<>();
        PriorityQueue<int[]> pq = new PriorityQueue<>(
            Comparator.comparingDouble(a -> a[1])
        );

        // Initialize all distances to infinity
        for (Integer node : graph.keySet()) {
            distance.put(node, Double.MAX_VALUE);
        }

        // Start node costs 0
        distance.put(startNode, 0.0);
        parent.put(startNode, -1);
        pq.offer(new int[]{startNode, 0});

        Set<Integer> processed = new HashSet<>();

        while (!pq.isEmpty()) {
            // Get node with minimum distance (greedy choice)
            int[] current = pq.poll();
            Integer currentNode = current[0];

            if (processed.contains(currentNode)) continue;
            processed.add(currentNode);
            if (currentNode.equals(targetNode)) break;

            // Explore neighbors
            List<EdgeInfo> neighbors = graph.getOrDefault(
                currentNode, new ArrayList<>()
            );

            for (EdgeInfo neighbor : neighbors) {
                Integer nextNode = neighbor.getTargetId();
                Double newDist = distance.get(currentNode)
                                 + neighbor.getWeight();

                // If we found a cheaper path, update it
                if (newDist < distance.getOrDefault(nextNode,Double.MAX_VALUE)) {
                    distance.put(nextNode, newDist);
                    parent.put(nextNode, currentNode);
                    pq.offer(new int[]{nextNode,
                              (int)(newDist * 100)});
                }
            }
        }

        // Reconstruct path
        List<Integer> path = reconstructPath(parent,startNode,targetNode);
        Double totalCost = distance.getOrDefault(
            targetNode, Double.MAX_VALUE
        );
        boolean reachable = totalCost != Double.MAX_VALUE;

        return new DijkstraResult(path, totalCost, reachable);
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
            path.add(0, current);
            current = parent.getOrDefault(current, -1);
        }
        return path;
    }

    public static class DijkstraResult {
        public List<Integer> easiestPath;
        public Double totalCost;
        public boolean reachable;

        public DijkstraResult(List<Integer> easiestPath,Double totalCost,boolean reachable) {
            this.easiestPath = easiestPath;
            this.totalCost = totalCost;
            this.reachable = reachable;
        }
    }
}