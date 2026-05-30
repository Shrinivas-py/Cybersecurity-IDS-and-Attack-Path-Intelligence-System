package com.graphshield.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.graphshield.dto.AnalysisResultDTO;
import com.graphshield.dto.AttackRequestDTO;
import com.graphshield.service.AttackService;

@RestController
@RequestMapping("/api/attack")
@CrossOrigin(origins = {
    "http://localhost:3000",
    "https://cybersecurity-ids-and-attack-path-i.vercel.app"
})
public class AttackController {

    private final AttackService attackService;

    public AttackController(AttackService attackService) {
        this.attackService = attackService;
    }

    // POST simulate an attack
    @PostMapping("/simulate")
    public ResponseEntity<AnalysisResultDTO> simulateAttack(@RequestBody AttackRequestDTO request) {
        AnalysisResultDTO result =
            attackService.simulateAttack(request);
        return ResponseEntity.ok(result);
    }
}