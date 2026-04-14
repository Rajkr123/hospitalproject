package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.model.User;
import com.college.hospitalproject.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        return ResponseEntity.ok(adminService.getAnalytics());
    }

    // ── DOCTORS ─────────────────────────────────

    /** All approved (ACTIVE) doctors */
    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> doctors() {
        return ResponseEntity.ok(adminService.getDoctors().stream()
                .map(this::toDoctorResponse).collect(Collectors.toList()));
    }

    /** Pending doctors waiting for approval */
    @GetMapping("/doctors/pending")
    public ResponseEntity<List<Map<String, Object>>> pendingDoctors() {
        return ResponseEntity.ok(adminService.getPendingDoctors().stream()
                .map(this::toDoctorResponse).collect(Collectors.toList()));
    }

    /** Admin approves a doctor */
    @PutMapping("/doctors/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(toDoctorResponse(adminService.approveDoctor(id)));
    }

    /** Admin rejects a doctor */
    @PutMapping("/doctors/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectDoctor(@PathVariable Long id) {
        return ResponseEntity.ok(toDoctorResponse(adminService.rejectDoctor(id)));
    }

    /** Admin deletes a doctor */
    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<Void> deleteDoctor(@PathVariable Long id) {
        adminService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    /** Admin adds a doctor directly (bypasses PENDING — comes in as ACTIVE) */
    @PostMapping("/doctors")
    public ResponseEntity<Map<String, Object>> addDoctor(@RequestBody User doctor) {
        return ResponseEntity.ok(toDoctorResponse(adminService.addDoctor(doctor)));
    }

    /** Admin edits a doctor's fields */
    @PutMapping("/doctors/{id}")
    public ResponseEntity<Map<String, Object>> updateDoctor(
            @PathVariable Long id,
            @RequestBody Map<String, String> updates) {
        return ResponseEntity.ok(toDoctorResponse(adminService.updateDoctor(id, updates)));
    }

    // ── PATIENTS ─────────────────────────────────

    @GetMapping("/patients")
    public ResponseEntity<List<Map<String, Object>>> patients() {
        return ResponseEntity.ok(adminService.getPatients().stream()
                .map(this::toUserResponse).collect(Collectors.toList()));
    }

    @DeleteMapping("/patients/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Long id) {
        adminService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    // ── APPOINTMENTS ─────────────────────────────

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> appointments() {
        return ResponseEntity.ok(adminService.getAppointments());
    }

    // ── Helpers ──────────────────────────────────

    private Map<String, Object> toDoctorResponse(User user) {
        return Map.of(
                "id",             user.getId(),
                "name",           user.getName() == null ? "" : user.getName(),
                "email",          user.getEmail() == null ? "" : user.getEmail(),
                "role",           user.getRole() == null ? "" : user.getRole().name(),
                "phone",          user.getPhone() == null ? "" : user.getPhone(),
                "gender",         user.getGender() == null ? "" : user.getGender(),
                "specialization", user.getSpecialization() == null ? "" : user.getSpecialization(),
                "qualification",  user.getQualification() == null ? "" : user.getQualification(),
                "experience",     user.getExperience() == null ? "" : user.getExperience(),
                "status",         user.getStatus() == null ? "ACTIVE" : user.getStatus().name()
        );
    }

    private Map<String, Object> toUserResponse(User user) {
        return Map.of(
                "id",               user.getId(),
                "name",             user.getName() == null ? "" : user.getName(),
                "email",            user.getEmail() == null ? "" : user.getEmail(),
                "role",             user.getRole() == null ? "" : user.getRole().name(),
                "phone",            user.getPhone() == null ? "" : user.getPhone(),
                "gender",           user.getGender() == null ? "" : user.getGender(),
                "dateOfBirth",      user.getDateOfBirth() == null ? "" : user.getDateOfBirth(),
                "bloodGroup",       user.getBloodGroup() == null ? "" : user.getBloodGroup(),
                "address",          user.getAddress() == null ? "" : user.getAddress(),
                "emergencyContact", user.getEmergencyContact() == null ? "" : user.getEmergencyContact()
        );
    }
}
