package com.college.hospitalproject.dto;

public class AppointmentRequestDTO {

    private Long patientId;
    private Long doctorId;
    private String patientName;
    private String doctorName;
    private String date;
    private String time;
    private String symptoms;

    // ✅ Getters

    public Long getPatientId() {
        return patientId;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getPatientName() {
        return patientName;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getDate() {
        return date;
    }

    public String getTime() {
        return time;
    }

    public String getSymptoms() {
        return symptoms;
    }

    // ✅ Setters

    public void setPatientId(Long patientId) {
        this.patientId = patientId;
    }

    public void setDoctorId(Long doctorId) {
        this.doctorId = doctorId;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }
}
