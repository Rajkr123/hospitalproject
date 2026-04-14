package com.college.hospitalproject.service;

import com.college.hospitalproject.model.Role;
import com.college.hospitalproject.model.User;
import com.college.hospitalproject.model.UserStatus;
import com.college.hospitalproject.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User register(User user) {
        if (user.getRole() == null) {
            user.setRole(Role.PATIENT);
        }

        user.setName(user.getName() != null ? user.getName().trim() : null);
        user.setEmail(user.getEmail() != null ? user.getEmail().trim().toLowerCase() : null);
        user.setPhone(user.getPhone() != null ? user.getPhone().trim() : null);
        user.setGender(user.getGender() != null ? user.getGender().trim() : null);
        user.setDateOfBirth(user.getDateOfBirth() != null ? user.getDateOfBirth().trim() : null);
        user.setBloodGroup(user.getBloodGroup() != null ? user.getBloodGroup().trim() : null);
        user.setAddress(user.getAddress() != null ? user.getAddress().trim() : null);
        user.setEmergencyContact(user.getEmergencyContact() != null ? user.getEmergencyContact().trim() : null);
        user.setSpecialization(user.getSpecialization() != null ? user.getSpecialization().trim() : null);
        user.setQualification(user.getQualification() != null ? user.getQualification().trim() : null);
        user.setExperience(user.getExperience() != null ? user.getExperience().trim() : null);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        // Doctors start as PENDING — admin must approve before they can login
        if (user.getRole() == Role.DOCTOR) {
            user.setStatus(UserStatus.PENDING);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        return userRepository.save(user);
    }

    public User login(String email, String password) {
        User user = userRepository.findByEmail(email.trim().toLowerCase()).orElse(null);
        if (user != null && passwordEncoder.matches(password, user.getPassword())) {
            return user;
        }
        return null;
    }

    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public List<User> getUsersByRole(String roleName) {
        try {
            Role role = Role.valueOf(roleName.toUpperCase());
            // For doctors listing (appointment booking), only return ACTIVE doctors
            if (role == Role.DOCTOR) {
                return userRepository.findByRoleAndStatus(Role.DOCTOR, UserStatus.ACTIVE);
            }
            return userRepository.findByRole(role);
        } catch (IllegalArgumentException e) {
            return List.of();
        }
    }
}
