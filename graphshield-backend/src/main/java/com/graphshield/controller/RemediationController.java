package com.graphshield.controller;

import com.graphshield.dto.AnalysisResultDTO;
import com.graphshield.dto.RemediationDTO;
import com.graphshield.service.RemediationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/remediation")
@CrossOrigin(origins = "*")
public class RemediationController {

    private final RemediationService remediationService;

    public RemediationController(
        RemediationService remediationService
    ) {
        this.remediationService = remediationService;
    }
    @PostMapping("/apply")
    public ResponseEntity<AnalysisResultDTO> applyRemediation(
        @RequestBody RemediationDTO request
    ) {
        AnalysisResultDTO result =
            remediationService.applyRemediation(request);
        return ResponseEntity.ok(result);
    }
}