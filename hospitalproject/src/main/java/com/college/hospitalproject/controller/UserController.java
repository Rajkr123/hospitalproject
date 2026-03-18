package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.User;
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
            resp.put("message", "User Registered Successfully");
            resp.put("id", saved.getId());
            resp.put("name", saved.getName());
            resp.put("email", saved.getEmail());
            resp.put("role", saved.getRole());
            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already registered"));
        }
    }

    // ✅ LOGIN — returns token + user info for frontend routing
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user) {
        User loggedUser = userService.login(user.getEmail(), user.getPassword());

        if (loggedUser != null) {
            String token = jwtUtil.generateToken(loggedUser.getEmail());
            Map<String, Object> resp = new HashMap<>();
            resp.put("token", token);
            resp.put("id", loggedUser.getId());
            resp.put("name", loggedUser.getName());
            resp.put("email", loggedUser.getEmail());
            resp.put("role", loggedUser.getRole().name());
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
                    return ResponseEntity.ok(resp);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // ✅ GET ALL DOCTORS (for appointment booking dropdown)
    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        return ResponseEntity.ok(userService.getUsersByRole("DOCTOR"));
    }
}