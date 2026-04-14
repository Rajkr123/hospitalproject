const API = "http://localhost:8083";
let adminState = {
    doctors: [],
    pendingDoctors: [],
    patients: [],
    appointments: [],
    analytics: null,
    dashboard: null,
    activeDoctorTab: 'active'
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
    if (section === "overview")     return loadAdminOverview();
    if (section === "doctors")      return loadDoctorsSection();
    if (section === "patients")     return loadPatientsSection();
    if (section === "appointments") return loadAppointmentsSection();
    if (section === "analytics")    return loadAnalyticsSection();
    if (section === "settings")     return restoreSettings();
}

// ═══════════════════════════════════════
// OVERVIEW
// ═══════════════════════════════════════
async function loadAdminOverview() {
    try {
        const [dashboardRes, appointmentsRes] = await Promise.all([
            fetch(API + "/admin/dashboard", { headers: authHeaders() }),
            fetch(API + "/admin/appointments", { headers: authHeaders() })
        ]);
        if (!dashboardRes.ok || !appointmentsRes.ok) throw new Error("Unable to load admin overview.");
        adminState.dashboard = await dashboardRes.json();
        adminState.appointments = await appointmentsRes.json();

        setText("heroDoctors",         adminState.dashboard.totalDoctors ?? 0);
        setText("heroPatients",        adminState.dashboard.totalPatients ?? 0);
        setText("heroAppointments",    adminState.dashboard.totalAppointments ?? 0);
        setText("overviewDoctors",     adminState.dashboard.totalDoctors ?? 0);
        setText("overviewPatients",    adminState.dashboard.totalPatients ?? 0);
        setText("overviewAppointments",adminState.dashboard.totalAppointments ?? 0);
        setText("overviewPending",     adminState.dashboard.pendingAppointments ?? 0);

        // Update pending doctors badge in sidebar
        const pendingCount = adminState.dashboard.pendingDoctors ?? 0;
        updatePendingBadge(pendingCount);

        renderOverviewAppointments(adminState.appointments);
    } catch (error) {
        renderErrorRow("overviewAppointmentsBody", 5, "Unable to load admin overview.");
        if (typeof showToast === "function") showToast(error.message || "Unable to load admin overview.", "error");
    }
}

function updatePendingBadge(count) {
    const badge = document.getElementById("pendingDoctorsBadge");
    const tabCount = document.getElementById("pendingTabCount");
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? "inline-flex" : "none";
    }
    if (tabCount) tabCount.textContent = count;
}

// ═══════════════════════════════════════
// DOCTORS
// ═══════════════════════════════════════
async function loadDoctorsSection() {
    try {
        const [activeRes, pendingRes] = await Promise.all([
            fetch(API + "/admin/doctors", { headers: authHeaders() }),
            fetch(API + "/admin/doctors/pending", { headers: authHeaders() })
        ]);
        if (!activeRes.ok || !pendingRes.ok) throw new Error("Unable to load doctors.");
        adminState.doctors = await activeRes.json();
        adminState.pendingDoctors = await pendingRes.json();

        renderActiveDoctors(adminState.doctors);
        renderPendingDoctors(adminState.pendingDoctors);
        updatePendingBadge(adminState.pendingDoctors.length);
    } catch (error) {
        renderErrorRow("doctorsTableBody", 6, "Unable to load doctors.");
        if (typeof showToast === "function") showToast(error.message || "Unable to load doctors.", "error");
    }
}

function renderActiveDoctors(doctors) {
    const tbody = document.getElementById("doctorsTableBody");
    if (!tbody) return;
    if (!doctors.length) {
        renderErrorRow("doctorsTableBody", 6, "No active doctor accounts found.");
        return;
    }
    tbody.innerHTML = doctors.map(d => `
        <tr>
            <td>
                <span class="td-name">${esc(d.name) || "-"}</span>
                <div class="td-sub"><i class="fas fa-stethoscope" style="color:#1e8cfa;margin-right:4px;"></i>${esc(d.specialization) || "No specialization"}</div>
            </td>
            <td>${esc(d.email) || "-"}</td>
            <td>${esc(d.phone) || "-"}</td>
            <td>${esc(d.qualification) || "-"}</td>
            <td>${esc(d.experience) ? d.experience + " yrs" : "-"}</td>
            <td>
                <button class="action-btn approve" onclick="openEditDoctorModal(${d.id})" title="Edit"><i class="fas fa-pen"></i></button>
                <button class="action-btn reject" onclick="deleteDoctor(${d.id})" title="Delete" style="margin-left:6px;"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join("");
}

function renderPendingDoctors(doctors) {
    const tbody = document.getElementById("pendingDoctorsTableBody");
    if (!tbody) return;
    if (!doctors.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="data-empty">No pending doctor requests.</td></tr>`;
        return;
    }
    tbody.innerHTML = doctors.map(d => `
        <tr>
            <td>
                <span class="td-name">${esc(d.name) || "-"}</span>
                <div class="td-sub"><i class="fas fa-stethoscope" style="color:#f59e0b;margin-right:4px;"></i>${esc(d.specialization) || "No specialization"}</div>
            </td>
            <td>${esc(d.email) || "-"}</td>
            <td>${esc(d.phone) || "-"}</td>
            <td>${esc(d.qualification) || "-"}</td>
            <td>${esc(d.experience) ? d.experience + " yrs" : "-"}</td>
            <td>
                <button class="action-btn approve" onclick="approveDoctor(${d.id})" title="Approve"><i class="fas fa-check"></i> Approve</button>
                <button class="action-btn reject" onclick="rejectDoctor(${d.id})" title="Reject" style="margin-left:6px;"><i class="fas fa-xmark"></i> Reject</button>
            </td>
        </tr>
    `).join("");
}

function switchDoctorTab(tab) {
    adminState.activeDoctorTab = tab;
    document.getElementById("tabActive").classList.toggle("active", tab === "active");
    document.getElementById("tabPending").classList.toggle("active", tab === "pending");
    document.getElementById("activeDoctorsPanel").style.display  = tab === "active"  ? "block" : "none";
    document.getElementById("pendingDoctorsPanel").style.display = tab === "pending" ? "block" : "none";
}

async function approveDoctor(id) {
    if (!confirm("Approve this doctor and grant dashboard access?")) return;
    try {
        const res = await fetch(`${API}/admin/doctors/${id}/approve`, { method: "PUT", headers: authHeaders() });
        if (!res.ok) throw new Error("Approval failed.");
        showToast("Doctor approved successfully!", "success");
        await loadDoctorsSection();
    } catch (e) { showToast(e.message, "error"); }
}

async function rejectDoctor(id) {
    if (!confirm("Reject this doctor registration?")) return;
    try {
        const res = await fetch(`${API}/admin/doctors/${id}/reject`, { method: "PUT", headers: authHeaders() });
        if (!res.ok) throw new Error("Rejection failed.");
        showToast("Doctor rejected.", "success");
        await loadDoctorsSection();
    } catch (e) { showToast(e.message, "error"); }
}

async function deleteDoctor(id) {
    if (!confirm("Permanently delete this doctor account? This cannot be undone.")) return;
    try {
        const res = await fetch(`${API}/admin/doctors/${id}`, { method: "DELETE", headers: authHeaders() });
        if (!res.ok) throw new Error("Delete failed.");
        showToast("Doctor deleted successfully.", "success");
        await loadDoctorsSection();
    } catch (e) { showToast(e.message, "error"); }
}

// ─── Add / Edit Doctor Modal ───────────────────────

function openAddDoctorModal() {
    clearModal();
    document.getElementById("modalTitle").innerHTML = '<i class="fas fa-user-plus" style="color:#1e8cfa;margin-right:8px;"></i> Add Doctor';
    document.getElementById("modalDoctorId").value = "";
    document.getElementById("mEmail").disabled = false;
    showModal();
}

function openEditDoctorModal(id) {
    const doctor = adminState.doctors.find(d => d.id === id);
    if (!doctor) return;
    clearModal();
    document.getElementById("modalTitle").innerHTML = '<i class="fas fa-pen" style="color:#1e8cfa;margin-right:8px;"></i> Edit Doctor';
    document.getElementById("modalDoctorId").value        = id;
    document.getElementById("mName").value                = doctor.name          || "";
    document.getElementById("mEmail").value               = doctor.email         || "";
    document.getElementById("mEmail").disabled            = true; // email not editable
    document.getElementById("mPhone").value               = doctor.phone         || "";
    document.getElementById("mGender").value              = doctor.gender        || "";
    document.getElementById("mBloodGroup").value          = doctor.bloodGroup    || "";
    document.getElementById("mSpecialization").value      = doctor.specialization|| "";
    document.getElementById("mQualification").value       = doctor.qualification || "";
    document.getElementById("mExperience").value          = doctor.experience    || "";
    document.getElementById("mAddress").value             = doctor.address       || "";
    showModal();
}

function clearModal() {
    ["mName","mEmail","mPassword","mPhone","mQualification","mExperience","mAddress"].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.value = ""; el.disabled = false; }
    });
    ["mGender","mBloodGroup","mSpecialization"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function showModal() {
    const m = document.getElementById("doctorModal");
    m.style.display = "flex";
    setTimeout(() => m.style.opacity = "1", 10);
}

function closeDoctorModal() {
    document.getElementById("doctorModal").style.display = "none";
}

async function submitDoctorModal(e) {
    e.preventDefault();
    const btn = document.getElementById("modalSubmitBtn");
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    btn.disabled = true;

    const id = document.getElementById("modalDoctorId").value;
    const payload = {
        name:           document.getElementById("mName").value.trim(),
        email:          document.getElementById("mEmail").value.trim(),
        password:       document.getElementById("mPassword").value,
        phone:          document.getElementById("mPhone").value.trim(),
        gender:         document.getElementById("mGender").value,
        bloodGroup:     document.getElementById("mBloodGroup").value,
        specialization: document.getElementById("mSpecialization").value,
        qualification:  document.getElementById("mQualification").value.trim(),
        experience:     document.getElementById("mExperience").value.trim(),
        address:        document.getElementById("mAddress").value.trim()
    };

    try {
        let res;
        if (id) {
            // Edit existing
            res = await fetch(`${API}/admin/doctors/${id}`, {
                method: "PUT",
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });
        } else {
            // Add new doctor (admin-created, directly ACTIVE)
            res = await fetch(`${API}/admin/doctors`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify(payload)
            });
        }
        if (!res.ok) throw new Error("Failed to save doctor.");
        showToast(id ? "Doctor updated successfully!" : "Doctor added successfully!", "success");
        closeDoctorModal();
        await loadDoctorsSection();
    } catch (err) {
        showToast(err.message, "error");
    }

    btn.innerHTML = '<i class="fas fa-save"></i> Save Doctor';
    btn.disabled = false;
}

// ═══════════════════════════════════════
// PATIENTS
// ═══════════════════════════════════════
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

function renderPatients(patients) {
    const tbody = document.getElementById("patientsTableBody");
    if (!tbody) return;
    if (!patients.length) {
        renderErrorRow("patientsTableBody", 5, "No patient accounts found.");
        return;
    }
    tbody.innerHTML = patients.map(p => `
        <tr>
            <td>
                <span class="td-name">${esc(p.name) || "-"}</span>
                <div class="td-sub">${esc(p.address) || "No address"}</div>
            </td>
            <td>${esc(p.email) || "-"}</td>
            <td>${esc(p.phone) || "-"}</td>
            <td>${esc(p.dateOfBirth) || "-"}</td>
            <td>${esc(p.emergencyContact) || "-"}</td>
        </tr>
    `).join("");
}

// ═══════════════════════════════════════
// APPOINTMENTS
// ═══════════════════════════════════════
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

function renderOverviewAppointments(appointments) {
    const tbody = document.getElementById("overviewAppointmentsBody");
    if (!tbody) return;
    const recent = [...appointments]
        .sort((a, b) => new Date(b.appointmentTime || 0) - new Date(a.appointmentTime || 0))
        .slice(0, 6);
    if (!recent.length) { renderErrorRow("overviewAppointmentsBody", 5, "No appointment activity yet."); return; }
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

function renderAppointments(appointments) {
    const tbody = document.getElementById("appointmentsTableBody");
    if (!tbody) return;
    if (!appointments.length) { renderErrorRow("appointmentsTableBody", 5, "No appointment requests found."); return; }
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
    setText("statTotalAppointments",   appointments.length);
    setText("statPendingAppointments", appointments.filter(i => i.status === "PENDING").length);
    setText("statConfirmedAppointments", appointments.filter(i => i.status === "CONFIRMED").length);
    setText("statRejectedAppointments",  appointments.filter(i => i.status === "REJECTED").length);
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

function approveAppointment(id) { updateAppointmentStatus(id, "approve"); }
function rejectAppointment(id)  { updateAppointmentStatus(id, "reject"); }

function updateAppointmentStatus(id, action) {
    fetch(`${API}/api/appointments/${id}/${action}`, { method: "PUT", headers: authHeaders() })
    .then(res => {
        if (!res.ok) throw new Error("Unable to update appointment.");
        return res.json();
    })
    .then(() => {
        if (typeof showToast === "function")
            showToast(`Appointment ${action === "approve" ? "confirmed" : "rejected"} successfully.`, "success");
        loadAdminOverview();
        loadAppointmentsSection();
        loadAnalyticsSection();
    })
    .catch(err => {
        if (typeof showToast === "function") showToast(err.message || "Unable to update appointment.", "error");
    });
}

// ═══════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════
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

function renderAnalytics(analytics) {
    setText("analyticsDoctors",        analytics.totalDoctors       ?? 0);
    setText("analyticsPatients",       analytics.totalPatients      ?? 0);
    setText("analyticsCompletionRate", `${analytics.completionRate  ?? 0}%`);
    setText("analyticsEngagementRate", `${analytics.engagementRate  ?? 0}%`);
    setText("analyticsPending",        analytics.pendingAppointments   ?? 0);
    setText("analyticsConfirmed",      analytics.confirmedAppointments ?? 0);
    setText("analyticsRejected",       analytics.rejectedAppointments  ?? 0);
    setText("analyticsSummaryOne",   `${analytics.totalDoctors ?? 0} active doctors on the platform. ${analytics.pendingDoctors ?? 0} pending approval.`);
    setText("analyticsSummaryTwo",   `${analytics.confirmedAppointments ?? 0} appointments confirmed out of ${analytics.totalAppointments ?? 0} total.`);
    setText("analyticsSummaryThree", `${analytics.totalPatients ?? 0} patients — engagement rate ${analytics.engagementRate ?? 0}%.`);
}

// ═══════════════════════════════════════
// SETTINGS
// ═══════════════════════════════════════
function bindSettingsForm() {
    const form = document.getElementById("adminSettingsForm");
    if (!form) return;
    form.addEventListener("submit", event => {
        event.preventDefault();
        const settings = {
            hospitalName:       document.getElementById("hospitalName").value.trim(),
            supportEmail:       document.getElementById("supportEmail").value.trim(),
            dashboardRefresh:   document.getElementById("dashboardRefresh").value,
            adminThemeAccent:   document.getElementById("adminThemeAccent").value
        };
        localStorage.setItem("adminSettings", JSON.stringify(settings));
        if (typeof showToast === "function") showToast("Admin settings saved successfully.", "success");
    });
}

function restoreSettings() {
    const saved = localStorage.getItem("adminSettings");
    if (!saved) return;
    try {
        const settings = JSON.parse(saved);
        const hn = document.getElementById("hospitalName");
        const se = document.getElementById("supportEmail");
        const dr = document.getElementById("dashboardRefresh");
        const ta = document.getElementById("adminThemeAccent");
        if (hn) hn.value = settings.hospitalName || "";
        if (se) se.value = settings.supportEmail  || "";
        if (dr) dr.value = settings.dashboardRefresh || "30000";
        if (ta) ta.value = settings.adminThemeAccent  || "blue";
    } catch (_) {}
}

// ═══════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════
function filterAdminTable(tbodyId, query) {
    document.querySelectorAll(`#${tbodyId} tr`).forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query.toLowerCase()) ? "" : "none";
    });
}

function setTodayDate() {
    const date = document.getElementById("today-date");
    if (date) date.textContent = new Date().toLocaleDateString("en-IN", {
        weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
}

function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

function esc(str) {
    if (!str) return "";
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

function formatDateTime(value) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString("en-IN", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

function formatStatus(status) {
    if (status === "CONFIRMED") return "Confirmed";
    if (status === "REJECTED")  return "Rejected";
    if (status === "PENDING")   return "Pending";
    return status || "Unknown";
}

function statusBadge(status) {
    if (status === "CONFIRMED") return "green";
    if (status === "REJECTED")  return "red";
    return "yellow";
}

function renderErrorRow(tbodyId, colspan, message) {
    const tbody = document.getElementById(tbodyId);
    if (tbody) tbody.innerHTML = `<tr><td colspan="${colspan}" class="data-empty">${message}</td></tr>`;
}
