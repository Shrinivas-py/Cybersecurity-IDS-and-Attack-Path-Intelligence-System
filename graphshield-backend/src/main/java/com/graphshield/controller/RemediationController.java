package com.graphshield.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.graphshield.dto.AnalysisResultDTO;
import com.graphshield.dto.RemediationDTO;
import com.graphshield.service.RemediationService;

@RestController
@RequestMapping("/api/remediation")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://cybersecurity-ids-and-attack-path-i.vercel.app",
    "https://graphshield.shrinivas-rj.me"
})
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