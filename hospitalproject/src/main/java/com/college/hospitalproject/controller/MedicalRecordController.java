package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.MedicalRecord;
import com.college.hospitalproject.service.MedicalRecordService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/records")
@CrossOrigin("*")
public class MedicalRecordController {

    private final MedicalRecordService service;

    public MedicalRecordController(MedicalRecordService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public MedicalRecord addRecord(@RequestBody MedicalRecord record) {
        return service.saveRecord(record);
    }

    @GetMapping("/patient/{patientId}")
    public List<MedicalRecord> getPatientRecords(@PathVariable Long patientId) {
        return service.getRecordsByPatient(patientId);
    }
}