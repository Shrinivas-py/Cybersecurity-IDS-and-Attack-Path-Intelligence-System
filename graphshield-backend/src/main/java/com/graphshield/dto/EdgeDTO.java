package com.graphshield.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

// Simplified edge info sent to frontend
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EdgeDTO {
    private Integer edgeId;
    private Integer sourceId;
    private Integer targetId;
    private BigDecimal weight;
    private Integer exploitDiff;
    private Boolean isActive;
}