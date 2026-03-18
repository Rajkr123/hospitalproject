package com.college.hospitalproject.service;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.model.Role;
import com.college.hospitalproject.model.User;
import com.college.hospitalproject.repository.AppointmentRepository;
import com.college.hospitalproject.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminService(UserRepository userRepository,
                        AppointmentRepository appointmentRepository) {

        this.userRepository = userRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public Map<String, Object> getDashboardStats() {

        Map<String, Object> data = new HashMap<>();

        data.put("totalUsers", userRepository.count());
        data.put("totalDoctors", userRepository.countByRole(Role.DOCTOR));
        data.put("totalPatients", userRepository.countByRole(Role.PATIENT));
        data.put("totalAppointments", appointmentRepository.count());
        data.put("pendingAppointments", appointmentRepository.countByStatus("PENDING"));
        data.put("confirmedAppointments", appointmentRepository.countByStatus("CONFIRMED"));
        data.put("rejectedAppointments", appointmentRepository.countByStatus("REJECTED"));

        return data;
    }

    public List<User> getDoctors() {
        return userRepository.findByRole(Role.DOCTOR);
    }

    public List<User> getPatients() {
        return userRepository.findByRole(Role.PATIENT);
    }

    public List<Appointment> getAppointments() {
        return appointmentRepository.findAll();
    }

    public Map<String, Object> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        long totalDoctors = userRepository.countByRole(Role.DOCTOR);
        long totalPatients = userRepository.countByRole(Role.PATIENT);
        long totalAppointments = appointmentRepository.count();
        long pendingAppointments = appointmentRepository.countByStatus("PENDING");
        long confirmedAppointments = appointmentRepository.countByStatus("CONFIRMED");
        long rejectedAppointments = appointmentRepository.countByStatus("REJECTED");

        analytics.put("totalDoctors", totalDoctors);
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
