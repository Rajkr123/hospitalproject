package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.model.MedicalRecord;

import com.college.hospitalproject.repository.AppointmentRepository;
import com.college.hospitalproject.repository.UserRepository;
import com.college.hospitalproject.service.AppointmentService;
import com.college.hospitalproject.service.MedicalRecordService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin("*")
public class DoctorController {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MedicalRecordService medicalRecordService;

    @Autowired
    private AppointmentService appointmentService;

    // ✅ Doctor Dashboard Stats
    @GetMapping("/{doctorId}/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@PathVariable Long doctorId) {
        List<Appointment> appts = appointmentRepository.findByDoctorId(doctorId);
        long total      = appts.size();
        long pending    = appts.stream().filter(a -> "PENDING".equals(a.getStatus())).count();
        long confirmed  = appts.stream().filter(a -> "CONFIRMED".equals(a.getStatus())).count();
        long rejected   = appts.stream().filter(a -> "REJECTED".equals(a.getStatus())).count();
        long completed  = appts.stream().filter(a -> "COMPLETED".equals(a.getStatus())).count();

        Set<Long> patientIds = appts.stream().map(Appointment::getPatientId).collect(Collectors.toSet());

        Map<String, Object> data = new HashMap<>();
        data.put("totalAppointments", total);
        data.put("pendingAppointments", pending);
        data.put("confirmedAppointments", confirmed);
        data.put("rejectedAppointments", rejected);
        data.put("completedAppointments", completed);
        data.put("totalPatients", patientIds.size());
        return ResponseEntity.ok(data);
    }

    // ✅ Doctor's Appointments (enriched with patient details)
    @GetMapping("/{doctorId}/appointments")
    public ResponseEntity<List<Map<String, Object>>> getDoctorAppointments(@PathVariable Long doctorId) {
        List<Appointment> appts = appointmentRepository.findByDoctorId(doctorId);
        List<Map<String, Object>> result = appts.stream()
            .sorted(Comparator.comparing(a -> a.getAppointmentTime() == null ? "" : a.getAppointmentTime().toString()))
            .map(a -> {
                Map<String, Object> m = new HashMap<>();
                m.put("id", a.getId());
                m.put("patientId", a.getPatientId());
                m.put("doctorId", a.getDoctorId());
                m.put("appointmentTime", a.getAppointmentTime());
                m.put("status", a.getStatus());
                m.put("notes", a.getNotes());
                m.put("paymentStatus", a.getPaymentStatus() != null ? a.getPaymentStatus() : "UNPAID");
                // Fetch patient name
                userRepository.findById(a.getPatientId()).ifPresent(u -> {
                    m.put("patientName", u.getName());
                    m.put("patientEmail", u.getEmail());
                    m.put("patientPhone", u.getPhone());
                    m.put("patientGender", u.getGender());
                    m.put("patientBloodGroup", u.getBloodGroup());
                });
                return m;
            }).collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ✅ Doctor's Patients (unique patients from appointments)
    @GetMapping("/{doctorId}/patients")
    public ResponseEntity<List<Map<String, Object>>> getDoctorPatients(@PathVariable Long doctorId) {
        List<Appointment> appts = appointmentRepository.findByDoctorId(doctorId);
        Set<Long> seenIds = new HashSet<>();
        List<Map<String, Object>> patients = new ArrayList<>();

        for (Appointment a : appts) {
            if (seenIds.add(a.getPatientId())) {
                userRepository.findById(a.getPatientId()).ifPresent(u -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", u.getId());
                    m.put("name", u.getName() == null ? "-" : u.getName());
                    m.put("email", u.getEmail() == null ? "-" : u.getEmail());
                    m.put("phone", u.getPhone() == null ? "-" : u.getPhone());
                    m.put("gender", u.getGender() == null ? "-" : u.getGender());
                    m.put("bloodGroup", u.getBloodGroup() == null ? "-" : u.getBloodGroup());
                    m.put("dateOfBirth", u.getDateOfBirth() == null ? "-" : u.getDateOfBirth());
                    patients.add(m);
                });
            }
        }
        return ResponseEntity.ok(patients);
    }

    // ✅ Patient Medical History (prescriptions for a specific patient)
    @GetMapping("/patients/{patientId}/records")
    public ResponseEntity<List<MedicalRecord>> getPatientRecords(@PathVariable Long patientId) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByPatient(patientId));
    }

    // ✅ Add Prescription / Medical Record
    @PostMapping("/{doctorId}/prescription")
    public ResponseEntity<MedicalRecord> addPrescription(
            @PathVariable Long doctorId,
            @RequestBody MedicalRecord record) {
        record.setDoctorId(doctorId);
        if (record.getDate() == null) {
            record.setDate(LocalDate.now());
        }
        return ResponseEntity.ok(medicalRecordService.saveRecord(record));
    }

    // ✅ Get prescriptions written by this doctor
    @GetMapping("/{doctorId}/prescriptions")
    public ResponseEntity<List<MedicalRecord>> getDoctorPrescriptions(@PathVariable Long doctorId) {
        return ResponseEntity.ok(medicalRecordService.getRecordsByDoctor(doctorId));
    }

    // ✅ Approve appointment
    @PutMapping("/appointments/{id}/approve")
    public ResponseEntity<Appointment> approve(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.approveAppointment(id));
    }

    // ✅ Reject appointment
    @PutMapping("/appointments/{id}/reject")
    public ResponseEntity<Appointment> reject(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.rejectAppointment(id));
    }

    // ✅ Complete appointment (doctor marks visit as done)
    @PutMapping("/appointments/{id}/complete")
    public ResponseEntity<Appointment> complete(@PathVariable Long id) {
        return ResponseEntity.ok(appointmentService.completeAppointment(id));
    }
}
