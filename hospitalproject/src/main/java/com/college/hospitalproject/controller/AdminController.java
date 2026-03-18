package com.college.hospitalproject.controller;

import com.college.hospitalproject.repository.AppointmentRepository;
import com.college.hospitalproject.repository.UserRepository;
import com.college.hospitalproject.model.Role;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminController(UserRepository userRepository,
                           AppointmentRepository appointmentRepository) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    // ✅ Admin Dashboard Stats — GET /admin/dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers",        userRepository.count());
        data.put("totalDoctors",      userRepository.countByRole(Role.DOCTOR));
        data.put("totalPatients",     userRepository.countByRole(Role.PATIENT));
        data.put("totalAppointments", appointmentRepository.count());
        return ResponseEntity.ok(data);
    }

    // ✅ Analytics — GET /admin/analytics
    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> analytics() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers",        userRepository.count());
        data.put("totalDoctors",      userRepository.countByRole(Role.DOCTOR));
        data.put("totalPatients",     userRepository.countByRole(Role.PATIENT));
        data.put("totalAppointments", appointmentRepository.count());
        return ResponseEntity.ok(data);
    }
}