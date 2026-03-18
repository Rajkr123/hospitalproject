// ================================
// DOCTOR DASHBOARD SYSTEM
// ================================

document.addEventListener("DOMContentLoaded", () => {

    loadDoctorDashboard();
    loadTodayAppointments();
    loadNotifications();

});


// ================================
// LOAD DASHBOARD STATS
// ================================

async function loadDoctorDashboard() {

    try {

        const res = await fetch("/api/doctor/dashboard");
        const data = await res.json();

        document.getElementById("todayAppointments").innerText = data.todayAppointments;
        document.getElementById("totalPatients").innerText = data.totalPatients;
        document.getElementById("pendingReview").innerText = data.pendingReview;
        document.getElementById("patientRating").innerText = data.rating;

    } catch (error) {

        console.error("Dashboard error:", error);

    }

}


// ================================
// LOAD TODAY APPOINTMENTS
// ================================

async function loadTodayAppointments() {

    try {

        const res = await fetch("/api/doctor/today-appointments");
        const appointments = await res.json();

        const table = document.getElementById("appointmentTable");

        table.innerHTML = "";

        appointments.forEach(app => {

            table.innerHTML += `

            <tr>

                <td>
                    ${app.patientName}
                    <br>
                    <small>Patient ID: ${app.patientId}</small>
                </td>

                <td>${app.time}</td>

                <td>${app.reason}</td>

                <td>
                    <span class="status ${app.status}">
                        ${app.status}
                    </span>
                </td>

                <td>

                    <button onclick="approveAppointment(${app.id})"
                        class="approve-btn">
                        Approve
                    </button>

                    <button onclick="rejectAppointment(${app.id})"
                        class="reject-btn">
                        Reject
                    </button>

                </td>

            </tr>

            `;

        });

    } catch (error) {

        console.error("Appointments error:", error);

    }

}



// ================================
// APPROVE APPOINTMENT
// ================================

async function approveAppointment(id) {

    await fetch(`/api/doctor/appointment/${id}/approve`, {

        method: "PUT"

    });

    loadTodayAppointments();
    loadDoctorDashboard();

}



// ================================
// REJECT APPOINTMENT
// ================================

async function rejectAppointment(id) {

    await fetch(`/api/doctor/appointment/${id}/reject`, {

        method: "PUT"

    });

    loadTodayAppointments();
    loadDoctorDashboard();

}



// ================================
// REFRESH DASHBOARD
// ================================

function refreshDashboard() {

    loadDoctorDashboard();
    loadTodayAppointments();
    loadNotifications();

}



// ================================
// LOAD NOTIFICATIONS
// ================================

async function loadNotifications() {

    try {

        const res = await fetch("/api/doctor/notifications");
        const notifications = await res.json();

        const bell = document.getElementById("notificationCount");

        if (bell) {
            bell.innerText = notifications.length;
        }

    } catch (error) {

        console.log("Notification error");

    }

}



// ================================
// AUTO REFRESH EVERY 30s
// ================================

setInterval(() => {

    loadDoctorDashboard();
    loadTodayAppointments();

}, 30000);