document.addEventListener("DOMContentLoaded", loadChart);

async function loadChart() {
    try {
        const res = await fetch("http://localhost:8083/api/admin/daily-revenue");
        const data = await res.json();

        const ctx = document.getElementById("appointmentChart");

        if (!ctx) {
            console.log("Canvas not found ❌");
            return;
        }

        const labels = data.map(item => item.date);
        const values = data.map(item => item.amount);

        new Chart(ctx, {
            type: "line",
            data: {
                labels: labels,
                datasets: [{
                    label: "Daily Revenue ₹",
                    data: values,
                    borderWidth: 2
                }]
            }
        });

    } catch (error) {
        console.log("Chart error:", error);
    }
}