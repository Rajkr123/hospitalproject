package com.college.hospitalproject.service;

import com.college.hospitalproject.model.Role;
import com.college.hospitalproject.repository.AppointmentRepository;
import com.college.hospitalproject.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
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

        return data;
    }
}