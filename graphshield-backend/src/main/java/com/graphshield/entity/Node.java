package com.graphshield.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data                    // Lombok: auto generates getters, setters, toString
@NoArgsConstructor       // Lombok: auto generates empty constructor
@AllArgsConstructor      // Lombok: auto generates full constructor
@Entity                  // JPA: this class maps to a DB table
@Table(name = "node")    // JPA: maps to the "node" table specifically
public class Node {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "node_id")
    private Integer nodeId;

    @Column(name = "node_name", nullable = false)
    private String nodeName;

    @Column(name = "node_type", nullable = false)
    private String nodeType;  //TYPES IG

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "risk_level")
    private Integer riskLevel = 0;

    @Column(name = "is_compromised")
    private Boolean isCompromised = false;

    @Column(name = "network_id")
    private Integer networkId = 1;
}