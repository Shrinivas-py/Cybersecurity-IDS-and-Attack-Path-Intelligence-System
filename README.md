# Cybersecurity Network Intrusion Detection and Attack Path Analysis System

## Overview

This project is a full-stack cybersecurity system that models computer networks as graphs to detect intrusions, analyze attack paths, and identify vulnerabilities.

The system leverages **Graph Theory**, **Design and Analysis of Algorithms (ADA)**, **Java (Spring Boot)**, and **Database Management Systems (DBMS)** to simulate and analyze network security scenarios in a structured and scalable way.

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

*   Custom Network Creation (Graph Input)
*   Intrusion Detection using graph traversal
*   Attack Path Analysis (All paths + shortest path)
*   Risk Scoring System
*   Vulnerability Detection (Critical Nodes & Edges)
*   Historical Analysis using DBMS
*   Interactive Frontend (React)

---

---

## How It Works

1. User creates a network (nodes + edges)
2. System stores the graph in the database
3. User simulates traffic or attack scenarios
4. Backend runs graph algorithms
5. System detects intrusion paths and vulnerabilities
6. Results are displayed with risk analysis

---

### Output:

* Attack Path Detected
* Risk Score: HIGH
* Critical Node: Database
* Suggested Fix: Restrict access between nodes

---

## Technologies Used

* **Frontend:** React.js/Next.js + Vue.js
* **Backend:** Java (Spring Boot)
* **Database:** PostgreSQL/MongoDB
* **Algorithms:** Graph-based (BFS, DFS, Dijkstra, Bellman-Ford, Ford-Fulkerson, etc.)

---

## Copyright

2026 © Shrinivas

---

