package com.college.hospitalproject.service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    public Order createOrder(int amount) throws Exception {

        RazorpayClient client = new RazorpayClient(keyId, keySecret);

        JSONObject obj = new JSONObject();
        obj.put("amount", amount * 100); // ₹ → paise
        obj.put("currency", "INR");
        obj.put("receipt", "txn_" + System.currentTimeMillis());

        return client.orders.create(obj);
    }
}