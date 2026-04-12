package com.college.hospitalproject.ai;

import com.college.hospitalproject.dto.AIResponseDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

@Service
public class SymptomService {

    @Value("${openai.api.key}")
    private String apiKey;

    private final String URL = "https://api.openai.com/v1/chat/completions";

    public AIResponseDTO analyzeSymptoms(String symptoms) {

        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> body = new HashMap<>();
        body.put("model", "gpt-4o-mini");

        List<Map<String, String>> messages = new ArrayList<>();

        // 🔥 STRONG PROMPT (IMPORTANT)
        messages.add(Map.of(
                "role", "system",
                "content", "You are a medical assistant. Respond ONLY in valid JSON like: {\"disease\":\"\",\"doctorType\":\"\",\"advice\":\"\"}. Do NOT add text outside JSON."
        ));

        messages.add(Map.of(
                "role", "user",
                "content", symptoms
        ));

        body.put("messages", messages);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity(URL, request, Map.class);

            Map choice = (Map) ((List) response.getBody().get("choices")).get(0);
            Map message = (Map) choice.get("message");

            String content = message.get("content").toString();

            // 🔥 CLEAN RESPONSE (VERY IMPORTANT)
            content = content.replaceAll("```json", "")
                    .replaceAll("```", "")
                    .trim();

            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(content, AIResponseDTO.class);

        } catch (Exception e) {
            e.printStackTrace();

            // 🔥 FALLBACK RESPONSE
            AIResponseDTO fallback = new AIResponseDTO();
            fallback.setDisease("Unable to analyze");
            fallback.setDoctorType("General Physician");
            fallback.setAdvice("Please consult a doctor");

            return fallback;
        }
    }
}