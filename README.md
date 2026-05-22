# GraphShield 🛡️
### A Framework for Predictive Network Intrusion Detection

> *Every other system optimizes routes between locations. GraphShield secures the network those routes run on.*

A full-stack cybersecurity system that models computer networks as **formal directed weighted graphs**, detects intrusion paths, predicts the next attack target, and recommends network hardening strategies — powered by Graph Theory, Algorithm Design, Java, and DBMS.

---

## Subject Integration at a Glance

| Subject | Code | How It's Used |
|---|---|---|
| Graph Theory | BCS405B | Network IS the graph — cut vertices, connectivity, Euler/Hamiltonian, SCC, planarity |
| Analysis & Design of Algorithms | BCS401 | BFS, DFS, Dijkstra, , Floyd-Warshall, Ford-Fulkerson — each mapped to a design paradigm |
| Database Management Systems | BCS403 | PostgreSQL (ER model, 3NF, SQL, triggers) + MongoDB (raw event logs) |
| Advanced Java | BIS402 | Spring Boot backend, Java Collections Framework (6 classes), JDBC, String Handling |

---

## Objectives

* Model a computer network as a directed weighted graph
* Detect possible intrusion paths in the network
* Identify the most vulnerable nodes and connections
* Analyze and visualize attack paths
* Store network data, logs, and alerts using DBMS
* Demonstrate real-world applications of graph algorithms in cybersecurity

---

## System Architecture

```text
React Frontend
      ↓
Java Spring Boot Backend
      ↓
MySQL Database
```

---

## Features

| Feature | Description |
|---|---|
| **Network Builder** | Create custom networks — define nodes (servers, routers, PCs) and weighted directed edges |
| **Intrusion Detection** | BFS sweep + DFS deep-path exploration to detect all possible attack routes |
| **Attack Path Analysis** | Dijkstra (shortest path), Bellman-Ford (with exploit weights), Floyd-Warshall (all-pairs) |
| **Critical Node Detection** | Cut vertex & cut edge analysis — nodes whose removal disconnects the network |
| **Attack Simulation Mode** | Step-by-step animated attack — watch BFS sweep → Dijkstra path → risk score update |
| **Attack Prediction Engine** | Predicts next likely target using degree centrality + historical attack frequency from DB |
| **Network Hardening Recommender** | Suggests redundant paths to eliminate cut vertices; estimates risk reduction % |
| **Graph Analysis Report** | Displays κ(G), SCCs, Eulerian check, planarity result, connectivity number |
| **Risk Heatmap** | Live frontend — red = high risk, green = safe, updated after every simulation |
| **DB Trigger Alerts** | PostgreSQL trigger auto-escalates node risk_level to HIGH on CRITICAL alert insert |

---

## System Architecture

```
┌─────────────────────────────────┐
│        React.js Frontend        │
│  (Graph viz + Risk Heatmap UI)  │
└────────────────┬────────────────┘
                 │ REST API
┌────────────────▼────────────────┐
│     Java Spring Boot Backend    │
│                                 │
│  ┌─────────────────────────┐    │
│  │   GraphService.java     │    │  ← BCS405B: Cut vertices, SCC,
│  │   (Graph Theory Layer)  │    │    connectivity, Euler/Hamiltonian
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  AlgorithmEngine.java   │    │  ← BCS401: BFS/DFS/Dijkstra/
│  │  (Algorithm Layer)      │    │    Bellman-Ford/Floyd-Warshall
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  PredictionEngine.java  │    │  ← Attack prediction using
│  │  (Intelligence Layer)   │    │    centrality + DB history
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │  CollectionsUtil.java   │    │  ← BIS402: Java Collections
│  │  LogFormatter.java      │    │    Framework + String Handling
│  │  DatabaseManager.java   │    │    + JDBC
│  └─────────────────────────┘    │
└──────┬──────────────────┬───────┘
       │                  │
┌──────▼──────┐    ┌──────▼──────┐
│ PostgreSQL  │    │   MongoDB   │
│             │    │             │
│ Structured  │    │ Raw event   │
│ graph data, │    │ logs (JSON, │
│ alerts, 3NF │    │ high-volume)│
└─────────────┘    └─────────────┘
```

---

## BCS405B — Graph Theory (Core Foundation)

The network is formally defined as **G = (V, E, W)** — a directed weighted graph where:
- **V** = set of network devices (servers, routers, workstations, firewalls)
- **E** = directed connections between devices
- **W** = edge weights representing vulnerability scores / exploit difficulty

| Graph Theory Concept | Application in GraphShield |
|---|---|
| **Directed Graph (Digraph)** | Attack direction matters — A→B ≠ B→A |
| **Weighted Edges** | Weight = vulnerability score of each connection |
| **Cut Vertices** | = Critical nodes — removal disconnects the network; highest protection priority |
| **Cut Edges** | = Critical links — single points of network failure |
| **Vertex Connectivity κ(G)** | Minimum nodes attacker must compromise to reach target = Risk Score |
| **Paths & Walks** | Attack sequence = walk; repeated-node exploit = circuit |
| **Connected Components** | Isolated subnets = safe zones; disconnected graph = segmented network |
| **Strongly Connected Components** | Tarjan's algorithm — finds zones of mutual reachability |
| **Euler Graph Check** | Can attacker traverse every connection once? (Full network sweep possible?) |
| **Hamiltonian Path** | Can attacker visit every node once? → NP-hard; discussed in context of P vs NP (BCS401 M5) |
| **Bipartite Graph** | Attacker nodes vs Target nodes — privilege escalation modeled as bipartite |
| **Spanning Tree** | MST = minimum-cost full-network compromise path (Kruskal's / Prim's) |
| **Planarity Check** | Non-planar network topology = complex attack surface flag |

**Graph Analysis Report Panel** (displayed in UI after every simulation):
```
κ(G)  : 2          (min 2 nodes to disconnect network)
SCCs  : 3          (3 strongly connected zones detected)
Euler : NO         (full network sweep not possible)
Planar: YES
Cut Vertices: [Router-2, DB-Server]
Cut Edges   : [Router-2 → Firewall-1]
```

---

## BCS401 — Analysis & Design of Algorithms

Every algorithm is chosen based on its **design paradigm** as studied in BCS401:

| Algorithm | Paradigm (BCS401 Module) | Use in GraphShield | Complexity |
|---|---|---|---|
| BFS | Decrease & Conquer (M2) | Level-by-level intrusion spread detection | O(V + E) |
| DFS | Decrease & Conquer (M2) | Deep attack path exploration, cycle detection | O(V + E) |
| Dijkstra | Greedy (M3) | Shortest (easiest) attack path | O((V+E) log V) |
| Bellman-Ford | Dynamic Programming (M4) | Paths with negative weights (defense-reducing exploits) | O(VE) |
| Floyd-Warshall | Dynamic Programming (M4) | All-pairs shortest attack paths between every node pair | O(V³) |
| Ford-Fulkerson | Greedy (M3) | Max attack flow / network bottleneck identification | O(VE²) |
| Kruskal's / Prim's | Greedy (M3) | MST = cheapest full network compromise | O(E log V) |
| Tarjan's SCC | Decrease & Conquer (M2) | Strongly connected component detection | O(V + E) |
| Backtracking | Backtracking (M5) | Enumerate ALL possible attack paths | Exponential |

**P vs NP Discussion (BCS401 Module 5):**
Finding the optimal Hamiltonian attack path (visiting every node once) is NP-hard. GraphShield acknowledges this and uses heuristic approximation, explicitly demonstrating why exact solutions are computationally infeasible for large networks.

---

## BCS403 — Database Management Systems

### ER Diagram (Entities)

```
Node ──────< Edge
 |                
 |──────< AttackSession
              |
              |──────< AttackPath
              |──────< Alert ──── (triggers risk update on Node)
```

### Schema (Normalized to 3NF)

```sql
Node        (node_id PK, ip_address, node_type, risk_level, degree)
Edge        (edge_id PK, source_node FK, target_node FK, weight, vuln_score)
AttackSession (session_id PK, start_time, attacker_node FK, target_node FK)
AttackPath  (path_id PK, session_id FK, node_sequence, total_risk, algorithm_used)
Alert       (alert_id PK, session_id FK, severity, timestamp, message)
```

### Key SQL Queries

```sql
-- Find all critical nodes (cut vertices) with HIGH risk
SELECT node_id, ip_address, risk_level
FROM Node WHERE risk_level = 'HIGH';

-- Find most frequent attack targets
SELECT target_node, COUNT(*) as attack_count
FROM AttackSession
GROUP BY target_node
ORDER BY attack_count DESC;

-- Find nodes that are cut vertices AND appeared in 2+ attack sessions
SELECT n.node_id, n.ip_address, COUNT(ap.path_id) as appearances
FROM Node n
JOIN AttackPath ap ON ap.node_sequence LIKE CONCAT('%', n.node_id, '%')
WHERE n.is_cut_vertex = TRUE
GROUP BY n.node_id HAVING appearances >= 2;
```

---

## BIS402 — Advanced Java

### Java Collections Framework (Module 1)

Every data structure is chosen for a specific algorithmic reason:

```java
// Graph stored as adjacency list
Map<String, List<Edge>> adjacencyList = new HashMap<>();

// Dijkstra's min-heap
PriorityQueue<Node> minHeap = new PriorityQueue<>(
    Comparator.comparingInt(n -> n.distance)
);

// Attack path — ordered, no duplicate nodes
Set<String> visited = new LinkedHashSet<>();

// Risk-sorted node groups for prediction engine
TreeMap<Integer, List<Node>> riskSortedNodes = new TreeMap<>(
    Collections.reverseOrder()
);

// DFS stack
Stack<String> dfsStack = new Stack<>();

// BFS queue
ArrayDeque<String> bfsQueue = new ArrayDeque<>();
```

Six distinct Collection classes — `HashMap`, `PriorityQueue`, `LinkedHashSet`, `TreeMap`, `Stack`, `ArrayDeque` — all justified by algorithm requirements.

### JDBC (Module 5) — DatabaseManager.java

```java
public class DatabaseManager {
    public void saveAttackSession(AttackSession session) { /* PreparedStatement */ }
    public List<Alert> getAlertsByNodeId(String nodeId) { /* ResultSet iteration */ }
    public void updateNodeRiskLevel(String nodeId, String level) { /* UPDATE query */ }
    public List<Node> getAllCriticalNodes() { /* WHERE is_cut_vertex = TRUE */ }
}
```

### String Handling (Module 2) — LogFormatter.java

```java
public class LogFormatter {
    public static String formatAlert(Alert a) {
        return new StringBuilder()
            .append("[").append(a.getSeverity()).append("] ")
            .append(a.getTimestamp()).append(" | ")
            .append("Node: ").append(a.getNodeId())
            .toString();
    }
    public static String[] parseIpAddress(String ip) {
        return ip.split("\\.");  // String.split() — Module 2
    }
}
```

---


## Technologies

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Backend | Java 17 + Spring Boot |
| Graph Algorithms | Custom Java implementation |
| Primary DB | PostgreSQL |
| Event Log DB | MongoDB |
| DB Connectivity | JDBC |

---



---

## Copyright
2026 © Shrinivas R Jahagirdar — IdlyLake
