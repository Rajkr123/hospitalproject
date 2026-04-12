package com.college.hospitalproject.controller;

import com.college.hospitalproject.ai.SymptomService;
import com.college.hospitalproject.dto.AIResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private SymptomService symptomService;

    @PostMapping("/analyze")
    public ResponseEntity<AIResponseDTO> analyze(@RequestBody Map<String, String> request) {

        String symptoms = request.get("symptoms");

        AIResponseDTO response = symptomService.analyzeSymptoms(symptoms);

        return ResponseEntity.ok(response);
    }
}