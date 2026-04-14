package com.college.hospitalproject.repository;

import com.college.hospitalproject.model.Role;
import com.college.hospitalproject.model.User;
import com.college.hospitalproject.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Long countByRole(Role role);
    List<User> findByRole(Role role);
    List<User> findByRoleAndStatus(Role role, UserStatus status);
    Long countByRoleAndStatus(Role role, UserStatus status);
}