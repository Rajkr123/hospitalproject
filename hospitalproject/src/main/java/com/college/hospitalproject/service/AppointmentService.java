package com.college.hospitalproject.service;

import com.college.hospitalproject.dto.AppointmentRequestDTO;
import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ✅ DTO → Entity conversion
    public Appointment completeAppointment(Long id) {

        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setStatus("COMPLETED");

        return appointmentRepository.save(appointment);
    }

    // ✅ Book Appointment (DTO → Entity)
    public Appointment bookAppointment(AppointmentRequestDTO dto) {

        Appointment appointment = new Appointment();

        appointment.setPatientId(dto.getPatientId());
        appointment.setDoctorId(dto.getDoctorId());
        appointment.setPatientName(dto.getPatientName());
        appointment.setDoctorName(dto.getDoctorName());
        appointment.setDate(dto.getDate());
        appointment.setTime(dto.getTime());
        appointment.setSymptoms(dto.getSymptoms());
        appointment.setStatus("PENDING");
        appointment.setAmount(647);
        appointment.setCreatedAt(LocalDateTime.now());

        if (dto.getDate() != null && dto.getTime() != null) {
            appointment.setAppointmentTime(LocalDateTime.parse(dto.getDate() + "T" + dto.getTime() + ":00"));
        }

        return appointmentRepository.save(appointment);
    }

    public List<Appointment> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }

    public List<Appointment> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctorId(doctorId);
    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Appointment approveAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("APPROVED");
        return appointmentRepository.save(appt);
    }

    public Appointment rejectAppointment(Long id) {
        Appointment appt = appointmentRepository.findById(id).orElseThrow();
        appt.setStatus("REJECTED");
        return appointmentRepository.save(appt);
    }
}
