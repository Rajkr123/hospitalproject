package com.college.hospitalproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.context.annotation.Bean;
import org.springframework.boot.CommandLineRunner;

import com.college.hospitalproject.model.User;
import com.college.hospitalproject.model.Role;
import com.college.hospitalproject.repository.UserRepository;

@SpringBootApplication
public class HospitalprojectApplication {

	public static void main(String[] args) {
		SpringApplication.run(HospitalprojectApplication.class, args);
	}

	@Bean
	CommandLineRunner initAdmin(UserRepository userRepository){

		return args -> {

			if(userRepository.findByEmail("admin@hospital.com")==null){

				User admin=new User();

				admin.setName("System Admin");
				admin.setEmail("admin@hospital.com");
				admin.setPassword("admin123");
				admin.setRole(Role.ADMIN);

				userRepository.save(admin);

				System.out.println("Admin Created");
			}

		};

	}

}