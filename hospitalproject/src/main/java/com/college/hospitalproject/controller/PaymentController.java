package com.college.hospitalproject.controller;

import com.college.hospitalproject.model.Appointment;
import com.college.hospitalproject.repository.AppointmentRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.Utils;
import jakarta.servlet.http.HttpServletResponse;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {

    @Value("${razorpay.key.id}")
    private String key;

    @Value("${razorpay.key.secret}")
    private String secret;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @GetMapping("/config")
    public Map<String, String> getPaymentConfig() {
        Map<String, String> response = new HashMap<>();
        response.put("key", key);
        return response;
    }

    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestParam int amount) {
        Map<String, Object> response = new HashMap<>();
        response.put("amount", amount * 100);
        response.put("currency", "INR");
        response.put("fallback", false);

        try {
            RazorpayClient client = new RazorpayClient(key, secret);
            JSONObject options = new JSONObject();
            options.put("amount", amount * 100);
            options.put("currency", "INR");
            options.put("receipt", "order_" + System.currentTimeMillis());

            Order order = client.orders.create(options);
            response.put("id", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
        } catch (Exception ex) {
            // Keep checkout usable in direct mode when backend cannot create Razorpay order.
            throw new RuntimeException("Order creation failed");
        }

        return response;
    }

    @PostMapping("/verify")
    public Appointment verifyAndSave(@RequestBody Map<String, String> data) throws Exception {
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");
        Long appointmentId = Long.parseLong(data.get("appointmentId"));

        if (paymentId == null || paymentId.isBlank()) {
            throw new RuntimeException("Payment ID missing");
        }

        if (orderId != null && !orderId.isBlank() && signature != null && !signature.isBlank()) {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", orderId);
            options.put("razorpay_payment_id", paymentId);
            options.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(options, secret);
            if (!isValid) {
                throw new RuntimeException("Payment verification failed");
            }
        }

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setPaymentStatus("PAID");
        appointment.setPaymentId(paymentId);
        appointment.setOrderId((orderId != null && !orderId.isBlank()) ? orderId : ("DIRECT-" + System.currentTimeMillis()));
        appointment.setCreatedAt(LocalDateTime.now());
        if (appointment.getAmount() <= 0) {
            appointment.setAmount(647);
        }

        return appointmentRepository.save(appointment);
    }

    @GetMapping("/history/{userId}")
    public List<Appointment> getHistory(@PathVariable Long userId) {
        return appointmentRepository.findByPatientId(userId);
    }

    @GetMapping("/receipt/{id}")
    public void generateReceipt(@PathVariable Long id, HttpServletResponse response) throws Exception {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=receipt.pdf");

        PdfWriter writer = new PdfWriter(response.getOutputStream());
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

        document.add(new Paragraph("SmartHealth Payment Receipt"));
        document.add(new Paragraph("-----------------------------"));
        document.add(new Paragraph("Patient Name: " + safe(appointment.getPatientName())));
        document.add(new Paragraph("Doctor Name: " + safe(appointment.getDoctorName())));
        document.add(new Paragraph("Amount: Rs. " + appointment.getAmount()));
        document.add(new Paragraph("Payment ID: " + safe(appointment.getPaymentId())));
        document.add(new Paragraph("Order ID: " + safe(appointment.getOrderId())));
        document.add(new Paragraph("Status: " + safe(appointment.getPaymentStatus())));
        document.add(new Paragraph("Date: " + (appointment.getCreatedAt() != null ? appointment.getCreatedAt().format(formatter) : "N/A")));

        document.close();
    }

    private String safe(String value) {
        return value == null || value.isBlank() ? "N/A" : value;
    }
}
