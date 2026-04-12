package com.college.hospitalproject.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointment")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long doctorId;
    private Long patientId;
    private Long slotId;

    private LocalDateTime appointmentTime;

    private String status;
    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    private String paymentStatus = "UNPAID";

    private String paymentId;
    private String orderId;

    private int amount;

    private String patientName;
    private String doctorName;
    private String date;      // ✅ IMPORTANT
    private String time;      // ✅ IMPORTANT
    private String symptoms;

    private LocalDateTime createdAt;

    @Column(length = 1000)
    private String notes;

    // ✅ GETTERS

    public Long getId() { return id; }
    public Long getDoctorId() { return doctorId; }
    public Long getPatientId() { return patientId; }
    public Long getSlotId() { return slotId; }
    public LocalDateTime getAppointmentTime() { return appointmentTime; }
    public String getStatus() { return status; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPaymentId() { return paymentId; }
    public String getOrderId() { return orderId; }
    public int getAmount() { return amount; }
    public String getPatientName() { return patientName; }
    public String getDoctorName() { return doctorName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public String getNotes() { return notes; }

    // ✅ SETTERS

    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }
    public void setPatientId(Long patientId) { this.patientId = patientId; }
    public void setSlotId(Long slotId) { this.slotId = slotId; }
    public void setAppointmentTime(LocalDateTime appointmentTime) { this.appointmentTime = appointmentTime; }
    public void setStatus(String status) { this.status = status; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
    public void setPaymentId(String paymentId) { this.paymentId = paymentId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }
    public void setAmount(int amount) { this.amount = amount; }
    public void setPatientName(String patientName) { this.patientName = patientName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setNotes(String notes) { this.notes = notes; }


}