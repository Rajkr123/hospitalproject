package com.college.hospitalproject.service;

import com.college.hospitalproject.model.MedicalRecord;
import com.college.hospitalproject.repository.MedicalRecordRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedicalRecordService {

    private final MedicalRecordRepository repository;

    public MedicalRecordService(MedicalRecordRepository repository) {
        this.repository = repository;
    }

    public MedicalRecord saveRecord(MedicalRecord record) {
        return repository.save(record);
    }

    public List<MedicalRecord> getRecordsByPatient(Long patientId) {
        return repository.findByPatientId(patientId);
    }
    public List<MedicalRecord> getRecordsByDoctor(Long doctorId) {
        return repository.findByDoctorId(doctorId);
    }
}