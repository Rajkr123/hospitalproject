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
import java.util.*;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin("*")
public class PaymentController {

    // 🔐 Secure keys (application.properties se aayenge)
    @Value("${razorpay.key}")
    private String KEY;

    @Value("${razorpay.secret}")
    private String SECRET;

    @Autowired
    private AppointmentRepository appointmentRepository;

    // ✅ 1. Create Order
    @PostMapping("/create-order")
    public Map<String, Object> createOrder(@RequestParam int amount) throws Exception {

        RazorpayClient client = new RazorpayClient(KEY, SECRET);

        JSONObject options = new JSONObject();
        options.put("amount", amount * 100); // paise
        options.put("currency", "INR");
        options.put("receipt", "order_" + System.currentTimeMillis());

        Order order = client.orders.create(options);

        Map<String, Object> response = new HashMap<>();
        response.put("id", order.get("id"));
        response.put("amount", order.get("amount"));

        return response;
    }

    // ✅ 2. Verify Payment + Save
    @PostMapping("/verify")
    public Appointment verifyAndSave(@RequestBody Map<String, String> data) throws Exception {

        // 🔹 Extract data
        String orderId = data.get("razorpay_order_id");
        String paymentId = data.get("razorpay_payment_id");
        String signature = data.get("razorpay_signature");
        Long appointmentId = Long.parseLong(data.get("appointmentId"));

        // 🔥 Correct verification
        JSONObject options = new JSONObject();
        options.put("razorpay_order_id", orderId);
        options.put("razorpay_payment_id", paymentId);
        options.put("razorpay_signature", signature);

        boolean isValid = Utils.verifyPaymentSignature(options, SECRET);

        if (!isValid) {
            throw new RuntimeException("Payment Verification Failed ❌");
        }

        // 🔥 Fetch appointment
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        // 🔥 Update payment details
        appt.setPaymentStatus("PAID");
        appt.setPaymentId(paymentId);
        appt.setOrderId(orderId);
        appt.setCreatedAt(LocalDateTime.now());

        return appointmentRepository.save(appt);
    }

    // ✅ 3. Payment History
    @GetMapping("/history/{userId}")
    public List<Appointment> getHistory(@PathVariable Long userId) {
        return appointmentRepository.findByPatientId(userId);
    }

    // ✅ 4. Generate PDF Receipt
    @GetMapping("/receipt/{id}")
    public void generateReceipt(@PathVariable Long id, HttpServletResponse response) throws Exception {

        Appointment appt = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=receipt.pdf");

        PdfWriter writer = new PdfWriter(response.getOutputStream());
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm");

        document.add(new Paragraph("SmartHealth Payment Receipt"));
        document.add(new Paragraph("-----------------------------"));
        document.add(new Paragraph("Patient Name: " + appt.getPatientName()));
        document.add(new Paragraph("Doctor Name: " + appt.getDoctorName()));
        document.add(new Paragraph("Amount: ₹" + appt.getAmount()));
        document.add(new Paragraph("Payment ID: " + appt.getPaymentId()));
        document.add(new Paragraph("Order ID: " + appt.getOrderId()));
        document.add(new Paragraph("Status: " + appt.getPaymentStatus()));
        document.add(new Paragraph("Date: " + appt.getCreatedAt().format(formatter)));

        document.close();
    }
}