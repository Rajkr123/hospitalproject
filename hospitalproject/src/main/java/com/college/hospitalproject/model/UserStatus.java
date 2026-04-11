package com.college.hospitalproject.model;

public enum UserStatus {
    ACTIVE,    // Patient (always), or Doctor approved by admin
    PENDING,   // Doctor waiting for admin approval
    REJECTED   // Doctor rejected by admin
}
