package com.graphshield.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "edge")
public class Edge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "edge_id")
    private Integer edgeId;

    @Column(name = "source_id", nullable = false)
    private Integer sourceId;

    @Column(name = "target_id", nullable = false)
    private Integer targetId;

    @Column(name = "weight", nullable = false)
    private BigDecimal weight;

    @Column(name = "exploit_diff")
    private Integer exploitDiff = 5;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "network_id")
    private Integer networkId = 1;
}