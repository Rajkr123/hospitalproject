package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.Slot;
import com.college.hospitalproject.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/slots")
@CrossOrigin("*")
public class SlotController {

    @Autowired
    private SlotRepository slotRepo;

    // ✅ GET DOCTOR SLOTS
    @GetMapping("/doctor/{id}")
    public List<Slot> getSlots(@PathVariable Long id){
        return slotRepo.findByDoctorId(id);
    }

}