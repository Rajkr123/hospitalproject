const API = "http://localhost:8083";

document.addEventListener("DOMContentLoaded", () => {
    loadAppointments();
});

function loadAppointments() {
    fetch(API + "/api/appointments/all", {
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") ? { "Authorization": "Bearer " + localStorage.getItem("token") } : {})
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Unable to load appointments");
        return res.json();
    })
    .then(data => {
        const tbody = document.getElementById("adminAppointmentsBody");
        if (!tbody) return;

        if (!data.length) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">No appointment requests available right now.</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = data
            .sort((a, b) => new Date(b.appointmentTime || 0) - new Date(a.appointmentTime || 0))
            .map(a => {
                const status = (a.status || "PENDING").toUpperCase();
                const badgeClass =
                    status === "APPROVED" || status === "CONFIRMED" ? "green" :
                    status === "REJECTED" ? "red" :
                    "yellow";

                return `
                    <tr>
                        <td><span class="td-name">Patient #${a.patientId ?? "-"}</span></td>
                        <td>Doctor #${a.doctorId ?? "-"}</td>
                        <td>${formatDateTime(a.appointmentTime)}</td>
                        <td><span class="badge badge-${badgeClass}">${formatStatus(status)}</span></td>
                        <td>
                            ${status === "PENDING"
                                ? `
                                    <button class="action-btn approve" onclick="approveAppointment(${a.id})"><i class="fas fa-check"></i> Approve</button>
                                    <button class="action-btn reject" onclick="rejectAppointment(${a.id})" style="margin-left:6px;"><i class="fas fa-xmark"></i> Reject</button>
                                  `
                                : `<span class="td-sub">Already ${formatStatus(status).toLowerCase()}</span>`
                            }
                        </td>
                    </tr>
                `;
            })
            .join("");
    })
    .catch(() => {
        const tbody = document.getElementById("adminAppointmentsBody");
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">Unable to load appointment requests.</td>
                </tr>
            `;
        }
    });
}

function approveAppointment(id) {
    updateAppointmentStatus(id, "approve");
}

function rejectAppointment(id) {
    updateAppointmentStatus(id, "reject");
}

function updateAppointmentStatus(id, action) {
    fetch(API + "/api/appointments/" + id + "/" + action, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(localStorage.getItem("token") ? { "Authorization": "Bearer " + localStorage.getItem("token") } : {})
        }
    })
    .then(res => {
        if (!res.ok) throw new Error("Unable to update appointment");
        return res.json();
    })
    .then(() => {
        if (typeof showToast === "function") {
            showToast("Appointment " + (action === "approve" ? "confirmed" : "rejected") + " successfully.", "success");
        }
        loadAppointments();
    })
    .catch(() => {
        if (typeof showToast === "function") {
            showToast("Unable to update appointment right now.", "error");
        }
    });
}

function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatStatus(status) {
    if (status === "APPROVED") return "Confirmed";
    if (status === "REJECTED") return "Rejected";
    if (status === "PENDING") return "Pending";
    return status.charAt(0) + status.slice(1).toLowerCase();
}
