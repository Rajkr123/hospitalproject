const API_BASE = "http://localhost:8083";

function processPayment() {

    const appointmentId = localStorage.getItem("lastBookedAppointmentId");

    fetch(API_BASE + "/api/payment/create-order?amount=647")
    .then(res => res.json())
    .then(order => {

        var options = {
            key: "rzp_test_Sb67cq4a9wW94Y",
            amount: order.amount,
            currency: "INR",
            name: "SmartHealth",
            description: "Appointment Payment",
            order_id: order.id,

            handler: async function (response) {

                await fetch(API_BASE + "/api/payment/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        appointmentId: appointmentId
                    })
                });

                alert("Payment Successful & Verified ✅");

                // ✅ Auto open receipt
                window.open(`${API_BASE}/api/payment/receipt/${appointmentId}`);
            }
        }; // ✅ IMPORTANT (closing bracket)

        var rzp = new Razorpay(options);
        rzp.open();
    })
    .catch(err => console.error(err));
}

// ✅ Manual Download Button
function downloadReceipt() {
    const appointmentId = localStorage.getItem("lastBookedAppointmentId");
    window.open(`${API_BASE}/api/payment/receipt/${appointmentId}`);
}