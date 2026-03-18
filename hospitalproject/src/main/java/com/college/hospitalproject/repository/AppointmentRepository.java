package com.college.hospitalproject.repository;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientId(Long patientId);

    List<Appointment> findByDoctorId(Long doctorId);

    Long countByStatus(String status);
}
