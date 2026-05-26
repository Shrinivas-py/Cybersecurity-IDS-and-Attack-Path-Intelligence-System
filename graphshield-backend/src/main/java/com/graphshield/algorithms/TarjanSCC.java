package com.graphshield.algorithms;

import com.graphshield.util.EdgeInfo;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class TarjanSCC {

    /**
     * DESIGN PARADIGM: DFS based
     * TIME COMPLEXITY:  O(V + E)
     * SPACE COMPLEXITY: O(V)
     *
     * USE CASE: Find strongly connected components
     */

    private int timer;
    private Stack<Integer> stack;
    private Set<Integer> onStack;
    private Map<Integer, Integer> disc;
    private Map<Integer, Integer> low;
    private List<List<Integer>> sccs;

    public SCCResult execute(Map<Integer, List<EdgeInfo>> graph) {
        timer = 0;
        stack = new Stack<>();
        onStack = new HashSet<>();
        disc = new HashMap<>();
        low = new HashMap<>();
        sccs = new ArrayList<>();

        // Initialize
        for (Integer node : graph.keySet()) {
            disc.put(node, -1);
        }

        // Run from each unvisited node
        for (Integer node : graph.keySet()) {
            if (disc.get(node) == -1) {
                dfs(graph, node);
            }
        }

        return new SCCResult(sccs);
    }

    private void dfs(Map<Integer, List<EdgeInfo>> graph,Integer u) {
        disc.put(u, timer);
        low.put(u, timer);
        timer++;
        stack.push(u);
        onStack.add(u);

        List<EdgeInfo> neighbors = graph.getOrDefault(
            u, new ArrayList<>()
        );

        for (EdgeInfo edge : neighbors) {
            Integer v = edge.getTargetId();

            if (disc.get(v) == -1) {
                dfs(graph, v);
                low.put(u, Math.min(low.get(u), low.get(v)));
            } else if (onStack.contains(v)) {
                low.put(u, Math.min(low.get(u), disc.get(v)));
            }
        }

        // If u is root of SCC, pop the stack
        if (low.get(u).equals(disc.get(u))) {
            List<Integer> scc = new ArrayList<>();
            Integer w;
            do {
                w = stack.pop();
                onStack.remove(w);
                scc.add(w);
            } while (!w.equals(u));
            sccs.add(scc);
        }
    }

    public static class SCCResult {
        public List<List<Integer>> components;
        public int totalComponents;

        public SCCResult(List<List<Integer>> components) {
            this.components = components;
            this.totalComponents = components.size();
        }
    }
}