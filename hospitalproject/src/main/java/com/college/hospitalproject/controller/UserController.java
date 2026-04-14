package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.User;
import com.college.hospitalproject.model.UserStatus;
import com.college.hospitalproject.service.UserService;
import com.college.hospitalproject.config.Jwtutil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private Jwtutil jwtUtil;

    // ✅ REGISTER
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User saved = userService.register(user);
            Map<String, Object> resp = new HashMap<>();
            resp.put("message", saved.getRole().name().equals("DOCTOR")
                ? "Doctor registration submitted. Awaiting admin approval."
                : "User Registered Successfully");
            resp.put("id", saved.getId());
            resp.put("name", saved.getName());
            resp.put("email", saved.getEmail());
            resp.put("role", saved.getRole());
            resp.put("status", saved.getStatus() != null ? saved.getStatus().name() : "ACTIVE");
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }
    }

    // ✅ LOGIN — returns token + user info; blocks PENDING doctors
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User loggedUser = userService.login(user.getEmail(), user.getPassword());

        if (loggedUser != null) {
            // Block PENDING doctors from logging in
            if (loggedUser.getStatus() == UserStatus.PENDING) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "PENDING_APPROVAL",
                                     "message", "Your account is pending admin approval. Please wait for the administrator to review your profile."));
            }

            // Block REJECTED doctors
            if (loggedUser.getStatus() == UserStatus.REJECTED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("error", "ACCOUNT_REJECTED",
                                     "message", "Your account has been rejected by the administrator. Please contact support."));
            }

            String token = jwtUtil.generateToken(loggedUser.getEmail());
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("id", loggedUser.getId());
            resp.put("name", loggedUser.getName());
            resp.put("email", loggedUser.getEmail());
            resp.put("role", loggedUser.getRole().name());
            resp.put("status", loggedUser.getStatus() != null ? loggedUser.getStatus().name() : "ACTIVE");
            resp.put("specialization", loggedUser.getSpecialization());
            resp.put("qualification", loggedUser.getQualification());
            return ResponseEntity.ok(resp);
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("error", "Invalid Email or Password"));
    }

    // ✅ GET USER BY ID (for profile display)
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(u -> {
                    Map<String, Object> resp = new HashMap<>();
                    resp.put("id", u.getId());
                    resp.put("name", u.getName());
                    resp.put("email", u.getEmail());
                    resp.put("role", u.getRole().name());
                    resp.put("status", u.getStatus() != null ? u.getStatus().name() : "ACTIVE");
                    resp.put("specialization", u.getSpecialization());
                    return ResponseEntity.ok(resp);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET ALL ACTIVE DOCTORS (for appointment booking dropdown)
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(userService.getUsersByRole("DOCTOR"));
    }
}