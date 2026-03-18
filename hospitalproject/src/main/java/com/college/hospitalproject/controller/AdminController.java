package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.model.User;
import com.college.hospitalproject.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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

    @GetMapping("/doctors")
    public ResponseEntity<List<Map<String, Object>>> doctors() {
        return ResponseEntity.ok(adminService.getDoctors().stream().map(this::toUserResponse).collect(Collectors.toList()));
    }

    @GetMapping("/patients")
    public ResponseEntity<List<Map<String, Object>>> patients() {
        return ResponseEntity.ok(adminService.getPatients().stream().map(this::toUserResponse).collect(Collectors.toList()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> appointments() {
        return ResponseEntity.ok(adminService.getAppointments());
    }

    private Map<String, Object> toUserResponse(User user) {
        return Map.of(
                "id", user.getId(),
                "name", user.getName() == null ? "" : user.getName(),
                "email", user.getEmail() == null ? "" : user.getEmail(),
                "role", user.getRole() == null ? "" : user.getRole().name(),
                "phone", user.getPhone() == null ? "" : user.getPhone(),
                "gender", user.getGender() == null ? "" : user.getGender(),
                "dateOfBirth", user.getDateOfBirth() == null ? "" : user.getDateOfBirth(),
                "bloodGroup", user.getBloodGroup() == null ? "" : user.getBloodGroup(),
                "address", user.getAddress() == null ? "" : user.getAddress(),
                "emergencyContact", user.getEmergencyContact() == null ? "" : user.getEmergencyContact()
        );
    }
}
