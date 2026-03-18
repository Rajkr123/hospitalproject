package com.college.hospitalproject.service;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.repository.AppointmentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    // ✅ Book Appointment
    public Appointment bookAppointment(Appointment appointment) {
        appointment.setStatus("PENDING");
        Appointment saved = appointmentRepository.save(appointment);
        try {
            emailService.sendEmail(
                    "patient@email.com",
                    "Appointment Booked",
                    "Your appointment has been booked. The doctor will review it soon."
            );
        } catch (Exception ignored) {}
        return saved;
    }

    // ✅ Patient Appointment History
    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    // ✅ Doctor Appointment List
    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    // ✅ All Appointments (Admin)
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    // ✅ Doctor Approve Appointment
    public Appointment approveAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus("APPROVED");
        Appointment updated = appointmentRepository.save(appointment);
        try {
            emailService.sendEmail(
                    "patient@email.com",
                    "Appointment Approved",
                    "Your appointment has been approved by the doctor."
            );
        } catch (Exception ignored) {}
        return updated;
    }

    // ✅ Doctor Reject Appointment
    public Appointment rejectAppointment(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        appointment.setStatus("REJECTED");
        Appointment updated = appointmentRepository.save(appointment);
        try {
            emailService.sendEmail(
                    "patient@email.com",
                    "Appointment Rejected",
                    "Your appointment request has been rejected by the doctor."
            );
        } catch (Exception ignored) {}
        return updated;
    }
}