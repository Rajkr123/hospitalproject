const API_BASE = "http://localhost:8083";
const PAYMENT_AMOUNT = 647;
const token = localStorage.getItem("token");

function authHeaders() {
    return token ? { "Authorization": "Bearer " + token } : {};
}

async function processPayment() {
    const appointmentId = localStorage.getItem("lastBookedAppointmentId");
    if (!appointmentId) {
        alert("Appointment not found. Please book again.");
        return;
    }

    try {
        const [configRes, orderRes] = await Promise.all([
            fetch(API_BASE + "/api/payment/config", { headers: authHeaders() }),
            fetch(API_BASE + `/api/payment/create-order?amount=${PAYMENT_AMOUNT}`, {
                method: "POST",
                headers: authHeaders()
            })
        ]);

        if (!configRes.ok || !orderRes.ok) {
            throw new Error("Unable to start payment right now.");
        }

        const config = await configRes.json();
        const order = await orderRes.json();

        const options = {
            key: config.key,
            amount: order.amount,
            currency: order.currency || "INR",
            name: "SmartHealth",
            description: "Appointment Payment",
            order_id: order.id,
            handler: async function (response) {
                const verifyRes = await fetch(API_BASE + "/api/payment/verify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        ...authHeaders()
                    },
                    body: JSON.stringify({
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        appointmentId: appointmentId
                    })
                });

                if (!verifyRes.ok) {
                    throw new Error("Payment was captured but verification failed.");
                }

                alert("Payment successful and verified.");
                window.open(`${API_BASE}/api/payment/receipt/${appointmentId}`);
            }
        };

        const rzp = new Razorpay(options);
        rzp.open();
    } catch (err) {
        console.error(err);
        alert(err.message || "Payment could not be started.");
    }
}

function downloadReceipt() {
    const appointmentId = localStorage.getItem("lastBookedAppointmentId");
    if (!appointmentId) {
        alert("No paid appointment found for receipt download.");
        return;
    }
    window.open(`${API_BASE}/api/payment/receipt/${appointmentId}`);
}
