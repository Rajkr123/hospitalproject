const API = "http://localhost:8083";
let adminState = {
    doctors: [],
    patients: [],
    appointments: [],
    analytics: null,
    dashboard: null
};

document.addEventListener("DOMContentLoaded", async () => {
    bindAdminNavigation();
    bindSettingsForm();
    setTodayDate();
    restoreSettings();
    await loadAdminOverview();
});

function authHeaders() {
    return {
        "Content-Type": "application/json",
        ...(localStorage.getItem("token") ? { "Authorization": "Bearer " + localStorage.getItem("token") } : {})
    };
}

function bindAdminNavigation() {
    document.querySelectorAll("[data-admin-nav]").forEach(link => {
        link.addEventListener("click", async event => {
            event.preventDefault();
            const section = link.getAttribute("data-admin-nav");
            activateAdminSection(section);
            await reloadAdminSection(section);
        });
    });
}

function activateAdminSection(section) {
    document.querySelectorAll("[data-admin-nav]").forEach(link => {
        link.classList.toggle("active", link.getAttribute("data-admin-nav") === section);
    });

    document.querySelectorAll("[data-admin-section]").forEach(panel => {
        panel.classList.toggle("active", panel.getAttribute("data-admin-section") === section);
    });

    const titles = {
        overview: "Admin Control Panel",
        doctors: "Manage Doctors",
        patients: "Manage Patients",
        appointments: "Appointments",
        analytics: "Analytics",
        settings: "Settings"
    };

    const title = document.getElementById("adminPageTitle");
    if (title) title.textContent = titles[section] || "Admin Control Panel";
}

async function reloadAdminSection(section) {
    if (section === "overview") return loadAdminOverview();
    if (section === "doctors") return loadDoctorsSection();
    if (section === "patients") return loadPatientsSection();
    if (section === "appointments") return loadAppointmentsSection();
    if (section === "analytics") return loadAnalyticsSection();
    if (section === "settings") return restoreSettings();
}

async function loadAdminOverview() {
    try {
        const [dashboardRes, appointmentsRes] = await Promise.all([
            fetch(API + "/admin/dashboard", { headers: authHeaders() }),
            fetch(API + "/admin/appointments", { headers: authHeaders() })
        ]);

        if (!dashboardRes.ok || !appointmentsRes.ok) throw new Error("Unable to load admin overview.");

        adminState.dashboard = await dashboardRes.json();
        adminState.appointments = await appointmentsRes.json();

        setText("heroDoctors", adminState.dashboard.totalDoctors ?? 0);
        setText("heroPatients", adminState.dashboard.totalPatients ?? 0);
        setText("heroAppointments", adminState.dashboard.totalAppointments ?? 0);
        setText("overviewDoctors", adminState.dashboard.totalDoctors ?? 0);
        setText("overviewPatients", adminState.dashboard.totalPatients ?? 0);
        setText("overviewAppointments", adminState.dashboard.totalAppointments ?? 0);
        setText("overviewPending", adminState.dashboard.pendingAppointments ?? 0);

        renderOverviewAppointments(adminState.appointments);
    } catch (error) {
        renderErrorRow("overviewAppointmentsBody", 5, "Unable to load admin overview.");
        if (typeof showToast === "function") showToast(error.message || "Unable to load admin overview.", "error");
    }
}

async function loadDoctorsSection() {
    try {
        const res = await fetch(API + "/admin/doctors", { headers: authHeaders() });
        if (!res.ok) throw new Error("Unable to load doctors.");
        adminState.doctors = await res.json();
        renderDoctors(adminState.doctors);
    } catch (error) {
        renderErrorRow("doctorsTableBody", 5, "Unable to load doctors.");
        if (typeof showToast === "function") showToast(error.message || "Unable to load doctors.", "error");
    }
}

async function loadPatientsSection() {
    try {
        const res = await fetch(API + "/admin/patients", { headers: authHeaders() });
        if (!res.ok) throw new Error("Unable to load patients.");
        adminState.patients = await res.json();
        renderPatients(adminState.patients);
    } catch (error) {
        renderErrorRow("patientsTableBody", 5, "Unable to load patients.");
        if (typeof showToast === "function") showToast(error.message || "Unable to load patients.", "error");
    }
}

async function loadAppointmentsSection() {
    try {
        const res = await fetch(API + "/admin/appointments", { headers: authHeaders() });
        if (!res.ok) throw new Error("Unable to load appointments.");
        adminState.appointments = await res.json();
        renderAppointments(adminState.appointments);
        renderAppointmentStats(adminState.appointments);
    } catch (error) {
        renderErrorRow("appointmentsTableBody", 5, "Unable to load appointments.");
        if (typeof showToast === "function") showToast(error.message || "Unable to load appointments.", "error");
    }
}

async function loadAnalyticsSection() {
    try {
        const res = await fetch(API + "/admin/analytics", { headers: authHeaders() });
        if (!res.ok) throw new Error("Unable to load analytics.");
        adminState.analytics = await res.json();
        renderAnalytics(adminState.analytics);
    } catch (error) {
        if (typeof showToast === "function") showToast(error.message || "Unable to load analytics.", "error");
    }
}

function renderOverviewAppointments(appointments) {
    const tbody = document.getElementById("overviewAppointmentsBody");
    if (!tbody) return;

    const recent = [...appointments]
        .sort((a, b) => new Date(b.appointmentTime || 0) - new Date(a.appointmentTime || 0))
        .slice(0, 6);

    if (!recent.length) {
        renderErrorRow("overviewAppointmentsBody", 5, "No appointment activity available yet.");
        return;
    }

    tbody.innerHTML = recent.map(item => `
        <tr>
            <td><span class="td-name">Patient #${item.patientId ?? "-"}</span></td>
            <td>Doctor #${item.doctorId ?? "-"}</td>
            <td>${formatDateTime(item.appointmentTime)}</td>
            <td><span class="badge badge-${statusBadge(item.status)}">${formatStatus(item.status)}</span></td>
            <td>${renderAppointmentAction(item)}</td>
        </tr>
    `).join("");
}

function renderDoctors(doctors) {
    const tbody = document.getElementById("doctorsTableBody");
    if (!tbody) return;

    if (!doctors.length) {
        renderErrorRow("doctorsTableBody", 5, "No doctor accounts found.");
        return;
    }

    tbody.innerHTML = doctors.map(doctor => `
        <tr>
            <td>
                <span class="td-name">${doctor.name || "-"}</span>
                <div class="td-sub">Role: ${doctor.role || "DOCTOR"}</div>
            </td>
            <td>${doctor.email || "-"}</td>
            <td>${doctor.phone || "-"}</td>
            <td>${doctor.gender || "-"}</td>
            <td>${doctor.bloodGroup || "-"}</td>
        </tr>
    `).join("");
}

function renderPatients(patients) {
    const tbody = document.getElementById("patientsTableBody");
    if (!tbody) return;

    if (!patients.length) {
        renderErrorRow("patientsTableBody", 5, "No patient accounts found.");
        return;
    }

    tbody.innerHTML = patients.map(patient => `
        <tr>
            <td>
                <span class="td-name">${patient.name || "-"}</span>
                <div class="td-sub">${patient.address || "No address provided"}</div>
            </td>
            <td>${patient.email || "-"}</td>
            <td>${patient.phone || "-"}</td>
            <td>${patient.dateOfBirth || "-"}</td>
            <td>${patient.emergencyContact || "-"}</td>
        </tr>
    `).join("");
}

function renderAppointments(appointments) {
    const tbody = document.getElementById("appointmentsTableBody");
    if (!tbody) return;

    if (!appointments.length) {
        renderErrorRow("appointmentsTableBody", 5, "No appointment requests found.");
        return;
    }

    tbody.innerHTML = [...appointments]
        .sort((a, b) => new Date(b.appointmentTime || 0) - new Date(a.appointmentTime || 0))
        .map(item => `
            <tr>
                <td><span class="td-name">Patient #${item.patientId ?? "-"}</span></td>
                <td>Doctor #${item.doctorId ?? "-"}</td>
                <td>${formatDateTime(item.appointmentTime)}</td>
                <td><span class="badge badge-${statusBadge(item.status)}">${formatStatus(item.status)}</span></td>
                <td>${renderAppointmentAction(item)}</td>
            </tr>
        `).join("");
}

function renderAppointmentStats(appointments) {
    const total = appointments.length;
    const pending = appointments.filter(item => item.status === "PENDING").length;
    const confirmed = appointments.filter(item => item.status === "CONFIRMED").length;
    const rejected = appointments.filter(item => item.status === "REJECTED").length;

    setText("statTotalAppointments", total);
    setText("statPendingAppointments", pending);
    setText("statConfirmedAppointments", confirmed);
    setText("statRejectedAppointments", rejected);
}

function renderAnalytics(analytics) {
    setText("analyticsDoctors", analytics.totalDoctors ?? 0);
    setText("analyticsPatients", analytics.totalPatients ?? 0);
    setText("analyticsCompletionRate", `${analytics.completionRate ?? 0}%`);
    setText("analyticsEngagementRate", `${analytics.engagementRate ?? 0}%`);
    setText("analyticsPending", analytics.pendingAppointments ?? 0);
    setText("analyticsConfirmed", analytics.confirmedAppointments ?? 0);
    setText("analyticsRejected", analytics.rejectedAppointments ?? 0);
    setText("analyticsSummaryOne", `${analytics.totalDoctors ?? 0} doctors are currently active across the platform.`);
    setText("analyticsSummaryTwo", `${analytics.confirmedAppointments ?? 0} appointments have been confirmed out of ${analytics.totalAppointments ?? 0} total requests.`);
    setText("analyticsSummaryThree", `${analytics.totalPatients ?? 0} patient accounts are driving an engagement rate of ${analytics.engagementRate ?? 0}%.`);
}

function renderAppointmentAction(item) {
    if (item.status === "PENDING") {
        return `
            <button class="action-btn approve" onclick="approveAppointment(${item.id})"><i class="fas fa-check"></i> Approve</button>
            <button class="action-btn reject" onclick="rejectAppointment(${item.id})" style="margin-left:6px;"><i class="fas fa-xmark"></i> Reject</button>
        `;
    }
    return `<span class="td-sub">Already ${formatStatus(item.status).toLowerCase()}</span>`;
}

function filterAdminTable(tbodyId, query) {
    const rows = document.querySelectorAll(`#${tbodyId} tr`);
    rows.forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query.toLowerCase()) ? "" : "none";
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
        headers: authHeaders()
    })
    .then(res => {
        if (!res.ok) throw new Error("Unable to update appointment.");
        return res.json();
    })
    .then(() => {
        if (typeof showToast === "function") {
            showToast(`Appointment ${action === "approve" ? "confirmed" : "rejected"} successfully.`, "success");
        }
        loadAdminOverview();
        loadAppointmentsSection();
        loadAnalyticsSection();
    })
    .catch(error => {
        if (typeof showToast === "function") {
            showToast(error.message || "Unable to update appointment.", "error");
        }
    });
}

function bindSettingsForm() {
    const form = document.getElementById("adminSettingsForm");
    if (!form) return;

    form.addEventListener("submit", event => {
        event.preventDefault();
        const settings = {
            hospitalName: document.getElementById("hospitalName").value.trim(),
            supportEmail: document.getElementById("supportEmail").value.trim(),
            dashboardRefresh: document.getElementById("dashboardRefresh").value,
            adminThemeAccent: document.getElementById("adminThemeAccent").value
        };

        localStorage.setItem("adminSettings", JSON.stringify(settings));
        if (typeof showToast === "function") {
            showToast("Admin settings saved successfully.", "success");
        }
    });
}

function restoreSettings() {
    const saved = localStorage.getItem("adminSettings");
    if (!saved) return;

    try {
        const settings = JSON.parse(saved);
        document.getElementById("hospitalName").value = settings.hospitalName || "";
        document.getElementById("supportEmail").value = settings.supportEmail || "";
        document.getElementById("dashboardRefresh").value = settings.dashboardRefresh || "30000";
        document.getElementById("adminThemeAccent").value = settings.adminThemeAccent || "blue";
    } catch (_) {}
}

function setTodayDate() {
    const date = document.getElementById("today-date");
    if (date) {
        date.textContent = new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    }
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
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
    if (status === "CONFIRMED") return "Confirmed";
    if (status === "REJECTED") return "Rejected";
    if (status === "PENDING") return "Pending";
    return status || "Unknown";
}

function statusBadge(status) {
    if (status === "CONFIRMED") return "green";
    if (status === "REJECTED") return "red";
    return "yellow";
}

function renderErrorRow(tbodyId, colspan, message) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="${colspan}" class="data-empty">${message}</td></tr>`;
}
