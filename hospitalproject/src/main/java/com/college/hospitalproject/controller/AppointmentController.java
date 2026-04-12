package com.college.hospitalproject.controller;

import com.college.hospitalproject.dto.ApiResponse;
import com.college.hospitalproject.dto.AppointmentRequestDTO;
import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")

@CrossOrigin("*")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    // ✅ Book Appointment (DTO based - FINAL)
    @PostMapping("/book")
    public ResponseEntity<ApiResponse<?>> book(@Valid @RequestBody AppointmentRequestDTO dto) {

        Appointment response = appointmentService.bookAppointment(dto);

        return ResponseEntity.ok(
                new ApiResponse<>("success", "Appointment booked", response)
        );
    }

    // ✅ Patient Appointment History
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Appointment>> getPatientAppointments(@PathVariable Long patientId) {
        return ResponseEntity.ok(appointmentService.getPatientAppointments(patientId));
    }

    // ✅ Doctor Appointment List
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Appointment>> getDoctorAppointments(@PathVariable Long doctorId) {
        return ResponseEntity.ok(appointmentService.getDoctorAppointments(doctorId));
    }

    // ✅ All Appointments (Admin)
    @GetMapping("/all")
    public ResponseEntity<List<Appointment>> getAllAppointments() {
        return ResponseEntity.ok(appointmentService.getAllAppointments());
    }

    // ✅ Approve Appointment
    @PutMapping("/{id}/approve")
    public ResponseEntity<Appointment> approveAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    // ✅ Reject Appointment
    @PutMapping("/{id}/reject")
    public ResponseEntity<Appointment> rejectAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }
}