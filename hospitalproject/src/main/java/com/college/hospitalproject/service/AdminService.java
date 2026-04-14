package com.college.hospitalproject.service;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.model.Role;
import com.college.hospitalproject.model.User;
import com.college.hospitalproject.model.UserStatus;
import com.college.hospitalproject.repository.AppointmentRepository;
import com.college.hospitalproject.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(UserRepository userRepository,
                        AppointmentRepository appointmentRepository,
                        PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> data = new HashMap<>();
        data.put("totalUsers", userRepository.count());
        data.put("totalDoctors", userRepository.countByRoleAndStatus(Role.DOCTOR, UserStatus.ACTIVE));
        data.put("pendingDoctors", userRepository.countByRoleAndStatus(Role.DOCTOR, UserStatus.PENDING));
        data.put("totalPatients", userRepository.countByRole(Role.PATIENT));
        data.put("totalAppointments", appointmentRepository.count());
        data.put("pendingAppointments", appointmentRepository.countByStatus("PENDING"));
        data.put("confirmedAppointments", appointmentRepository.countByStatus("CONFIRMED"));
        data.put("rejectedAppointments", appointmentRepository.countByStatus("REJECTED"));
        return data;
    }

    // All approved doctors
    public List<User> getDoctors() {
        return userRepository.findByRoleAndStatus(Role.DOCTOR, UserStatus.ACTIVE);
    }

    // Pending doctors awaiting approval
    public List<User> getPendingDoctors() {
        return userRepository.findByRoleAndStatus(Role.DOCTOR, UserStatus.PENDING);
    }

    // Approve a doctor
    public User approveDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(UserStatus.ACTIVE);
        return userRepository.save(doctor);
    }

    // Reject a doctor
    public User rejectDoctor(Long doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doctor.setStatus(UserStatus.REJECTED);
        return userRepository.save(doctor);
    }

    // Delete a doctor
    public void deleteDoctor(Long doctorId) {
        userRepository.deleteById(doctorId);
    }

    // Add a doctor directly (created by admin, already ACTIVE)
    public User addDoctor(User doctor) {
        doctor.setRole(Role.DOCTOR);
        doctor.setStatus(UserStatus.ACTIVE);
        if (doctor.getPassword() != null && !doctor.getPassword().isEmpty()) {
            doctor.setPassword(passwordEncoder.encode(doctor.getPassword()));
        }
        return userRepository.save(doctor);
    }

    // Update a doctor's profile
    public User updateDoctor(Long doctorId, Map<String, String> updates) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (updates.containsKey("name"))           doctor.setName(updates.get("name"));
        if (updates.containsKey("phone"))          doctor.setPhone(updates.get("phone"));
        if (updates.containsKey("gender"))         doctor.setGender(updates.get("gender"));
        if (updates.containsKey("specialization")) doctor.setSpecialization(updates.get("specialization"));
        if (updates.containsKey("qualification"))  doctor.setQualification(updates.get("qualification"));
        if (updates.containsKey("experience"))     doctor.setExperience(updates.get("experience"));
        if (updates.containsKey("address"))        doctor.setAddress(updates.get("address"));
        if (updates.containsKey("bloodGroup"))     doctor.setBloodGroup(updates.get("bloodGroup"));

        // Only update password if provided
        if (updates.containsKey("password") && updates.get("password") != null && !updates.get("password").isBlank()) {
            doctor.setPassword(passwordEncoder.encode(updates.get("password")));
        }

        return userRepository.save(doctor);
    }

    public List<User> getPatients() {
        return userRepository.findByRole(Role.PATIENT);
    }

    public Optional<User> getPatientById(Long id) {
        return userRepository.findById(id);
    }

    public void deletePatient(Long id) {
        userRepository.deleteById(id);
    }

    public List<Appointment> getAppointments() {
        return appointmentRepository.findAll();
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();
        long totalDoctors = userRepository.countByRoleAndStatus(Role.DOCTOR, UserStatus.ACTIVE);
        long pendingDoctors = userRepository.countByRoleAndStatus(Role.DOCTOR, UserStatus.PENDING);
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        long totalAppointments = appointmentRepository.count();
        long pendingAppointments = appointmentRepository.countByStatus("PENDING");
        long confirmedAppointments = appointmentRepository.countByStatus("CONFIRMED");
        long rejectedAppointments = appointmentRepository.countByStatus("REJECTED");

        analytics.put("totalDoctors", totalDoctors);
        analytics.put("pendingDoctors", pendingDoctors);
        analytics.put("totalPatients", totalPatients);
        analytics.put("totalAppointments", totalAppointments);
        analytics.put("pendingAppointments", pendingAppointments);
        analytics.put("confirmedAppointments", confirmedAppointments);
        analytics.put("rejectedAppointments", rejectedAppointments);
        analytics.put("completionRate", totalAppointments == 0 ? 0 : Math.round((confirmedAppointments * 100.0) / totalAppointments));
        analytics.put("engagementRate", totalPatients == 0 ? 0 : Math.round((totalAppointments * 100.0) / totalPatients));

        return analytics;
    }
}
