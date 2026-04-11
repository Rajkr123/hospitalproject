package com.college.hospitalproject.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDate;

@Entity

public class MedicalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long patientId;

    private Long doctorId;

    private String diagnosis;

    private String prescription;

    private String reportFile;

    private LocalDate date;
    public Long getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    // getters setters
}