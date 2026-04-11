// doctor-dashboard.js — Doctor Portal Logic (Full Manual Flow)

const API = "http://localhost:8083";
let doctorId = null;
let docState = { appointments: [], patients: [], prescriptions: [], history: [] };
let _apptCache = {}; // keyed by appt ID — used by treatment modal

// =========================
// INIT
// =========================
document.addEventListener("DOMContentLoaded", () => {
    doctorId = parseInt(localStorage.getItem("userId"), 10);
    if (!doctorId) {
        window.location.href = "login.html";
        return;
    }

    const dateEl = document.getElementById("docTodayDate");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString("en-IN", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.clear();
            window.location.href = "../index.html";
        });
    }

    document.querySelectorAll("[data-doc-nav]").forEach(link => {
        link.addEventListener("click", e => {
            e.preventDefault();
            switchDocSection(link.getAttribute("data-doc-nav"));
        });
    });

    loadDocOverview();
});

// =========================
// NAVIGATION
// =========================
function switchDocSection(section) {
    document.querySelectorAll("[data-doc-nav]").forEach(l => {
        l.classList.toggle("active", l.getAttribute("data-doc-nav") === section);
    });
    document.querySelectorAll("[data-doc-section]").forEach(s => {
        s.classList.toggle("active", s.getAttribute("data-doc-section") === section);
    });

    const titles = {
        overview:      "Doctor Overview",
        appointments:  "My Appointments",
        patients:      "My Patients",
        prescriptions: "Prescriptions",
        history:       "Patient History"
    };
    const el = document.getElementById("docPageTitle");
    if (el) el.textContent = titles[section] || "Doctor Dashboard";

    if (section === "overview")      loadDocOverview();
    if (section === "appointments")  loadDocAppointments();
    if (section === "patients")      loadDocPatients();
    if (section === "prescriptions") loadDocPrescriptions();
    if (section === "history")       loadDocPatients();
}

// =========================
// DATA LOADERS
// =========================
async function loadDocOverview() {
    try {
        const [dashRes, apptsRes] = await Promise.all([
            fetch(`${API}/api/doctor/${doctorId}/dashboard`),
            fetch(`${API}/api/doctor/${doctorId}/appointments`)
        ]);
        if (!dashRes.ok || !apptsRes.ok) throw new Error("Failed to load overview");

        const dash  = await dashRes.json();
        const appts = await apptsRes.json();
        docState.appointments = appts;
        appts.forEach(a => { if (a.id) _apptCache[a.id] = a; });

        setText("heroTotalAppts",    dash.totalAppointments   ?? 0);
        setText("heroPendingAppts",  dash.pendingAppointments ?? 0);
        setText("heroTotalPatients", dash.totalPatients       ?? 0);
        setText("cardTotalAppts",    dash.totalAppointments   ?? 0);
        setText("cardPending",       dash.pendingAppointments ?? 0);
        setText("cardPatients",      dash.totalPatients       ?? 0);
        setText("cardConfirmed",     (dash.confirmedAppointments ?? 0) + (dash.completedAppointments ?? 0));

        renderOverviewAppointments(appts.slice(0, 6));
    } catch (err) {
        renderEmptyRow("docOverviewBody", 4, "Unable to load overview. Make sure backend is running.");
        showToast("Dashboard load failed: " + err.message, "error");
    }
}

async function loadDocAppointments() {
    try {
        const res = await fetch(`${API}/api/doctor/${doctorId}/appointments`);
        if (!res.ok) throw new Error("Failed to load appointments");
        const appts = await res.json();
        docState.appointments = appts;
        appts.forEach(a => { if (a.id) _apptCache[a.id] = a; });
        renderAppointments(appts);
        renderApptStats(appts);
    } catch (err) {
        renderEmptyRow("docApptsBody", 6, "Unable to load appointments.");
        showToast(err.message, "error");
    }
}

async function loadDocPatients() {
    try {
        const res = await fetch(`${API}/api/doctor/${doctorId}/patients`);
        if (!res.ok) throw new Error("Failed to load patients");
        const patients = await res.json();
        docState.patients = patients;
        renderPatients(patients);
        const historyTbody = document.getElementById("docHistoryBody");
        if (historyTbody) renderHistoryPatients(patients);
    } catch (err) {
        renderEmptyRow("docPatientsBody", 7, "Unable to load patients.");
        showToast(err.message, "error");
    }
}

async function loadDocPrescriptions() {
    try {
        if (!docState.patients.length) {
            const pRes = await fetch(`${API}/api/doctor/${doctorId}/patients`);
            if (pRes.ok) docState.patients = await pRes.json();
        }
        const res = await fetch(`${API}/api/doctor/${doctorId}/prescriptions`);
        if (!res.ok) throw new Error("Failed to load prescriptions");
        const rxList = await res.json();
        docState.prescriptions = rxList;
        renderPrescriptions(rxList);
    } catch (err) {
        renderEmptyRow("docRxBody", 4, "Unable to load prescriptions.");
        showToast(err.message, "error");
    }
}

async function loadPatientHistory(patientId, patientName) {
    try {
        const res = await fetch(`${API}/api/doctor/patients/${patientId}/records`);
        if (!res.ok) throw new Error("Failed to load patient records");
        const records = await res.json();
        const container = document.getElementById("patientHistoryRecords");
        const title     = document.getElementById("patientHistoryTitle");
        if (title) title.textContent = `History: ${patientName || "Patient #" + patientId}`;
        if (!container) return;
        if (!records.length) {
            container.innerHTML = `<p style="color:#94a3b8;padding:10px 0;"><i class="fas fa-info-circle"></i> No medical records found for this patient.</p>`;
            return;
        }
        container.innerHTML = records.map(rx => `
            <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:10px;padding:14px 16px;margin-bottom:10px;">
                <div style="font-weight:600;color:#f8fafc;margin-bottom:4px;"><i class="fas fa-stethoscope" style="color:#7c5cff;margin-right:6px;"></i>${rx.diagnosis || "No diagnosis"}</div>
                <div style="color:#94a3b8;font-size:0.83rem;margin-bottom:6px;white-space:pre-wrap;"><i class="fas fa-pills" style="color:#1394eb;margin-right:6px;"></i>${rx.prescription || "-"}</div>
                <div style="color:#475569;font-size:0.78rem;"><i class="fas fa-calendar-day" style="margin-right:4px;"></i>${rx.date || "-"}</div>
            </div>
        `).join("");
    } catch (err) {
        showToast("Could not load patient history: " + err.message, "error");
    }
}

// =========================
// RENDER FUNCTIONS
// =========================
function renderOverviewAppointments(appts) {
    const tbody = document.getElementById("docOverviewBody");
    if (!tbody) return;
    if (!appts.length) { renderEmptyRow("docOverviewBody", 4, "No appointments yet."); return; }
    tbody.innerHTML = appts.map(a => `
        <tr>
            <td>
                <span class="td-name">${a.patientName || "Patient #" + a.patientId}</span>
                ${a.notes ? `<div class="td-sub" style="color:#a78bfa;font-size:0.71rem;"><i class="fas fa-notes-medical"></i> ${a.notes.length > 40 ? a.notes.substring(0,40)+"..." : a.notes}</div>` : ""}
            </td>
            <td>${formatDT(a.appointmentTime)}</td>
            <td>${badgeHtml(a.status)}</td>
            <td>${apptActions(a)}</td>
        </tr>
    `).join("");
}

function renderAppointments(appts) {
    const tbody = document.getElementById("docApptsBody");
    if (!tbody) return;
    if (!appts.length) { renderEmptyRow("docApptsBody", 6, "No appointments assigned yet."); return; }

    const sorted = [...appts].sort((a, b) =>
        new Date(b.appointmentTime || 0) - new Date(a.appointmentTime || 0));

    tbody.innerHTML = sorted.map(a => `
        <tr>
            <td>
                <span class="td-name">${a.patientName || "Patient #" + a.patientId}</span>
                <div class="td-sub">${a.patientPhone || a.patientEmail || "No contact"}</div>
                ${a.notes ? `<div class="td-sub" style="color:#a78bfa;font-size:0.71rem;margin-top:3px;"><i class="fas fa-notes-medical"></i> ${a.notes.length > 55 ? a.notes.substring(0,55)+"..." : a.notes}</div>` : ""}
            </td>
            <td>${a.patientGender || "-"} · ${a.patientBloodGroup || "-"}</td>
            <td>${formatDT(a.appointmentTime)}</td>
            <td>
                ${badgeHtml(a.status)}
                <div style="margin-top:3px;">${paymentBadge(a.paymentStatus)}</div>
            </td>
            <td>${apptActions(a)}</td>
        </tr>
    `).join("");
}

function renderApptStats(appts) {
    setText("apptTotal",     appts.length);
    setText("apptPending",   appts.filter(a => a.status === "PENDING").length);
    setText("apptConfirmed", appts.filter(a => a.status === "CONFIRMED").length);
    setText("apptRejected",  appts.filter(a => a.status === "REJECTED").length);
    const completedEl = document.getElementById("apptCompleted");
    if (completedEl) completedEl.textContent = appts.filter(a => a.status === "COMPLETED").length;
}

function renderPatients(patients) {
    const tbody = document.getElementById("docPatientsBody");
    if (!tbody) return;
    if (!patients.length) { renderEmptyRow("docPatientsBody", 7, "No patients assigned yet."); return; }
    tbody.innerHTML = patients.map(p => `
        <tr>
            <td><span class="td-name">${p.name || "-"}</span></td>
            <td>${p.email || "-"}</td>
            <td>${p.phone || "-"}</td>
            <td>${p.gender || "-"}</td>
            <td>${p.bloodGroup || "-"}</td>
            <td>${p.dateOfBirth || "-"}</td>
            <td>
                <button class="action-btn primary" onclick="openRxModal(${p.id}, '${(p.name||"").replace(/'/g,"\\'")}', null, null)">
                    <i class="fas fa-file-prescription"></i> Add Rx
                </button>
                <button class="action-btn" onclick="showPatientHistory(${p.id}, '${(p.name||"").replace(/'/g,"\\'")}')">
                    <i class="fas fa-history"></i> History
                </button>
            </td>
        </tr>
    `).join("");
}

function renderHistoryPatients(patients) {
    const tbody = document.getElementById("docHistoryBody");
    if (!tbody) return;
    if (!patients.length) { renderEmptyRow("docHistoryBody", 2, "No patients assigned yet."); return; }
    tbody.innerHTML = patients.map(p => `
        <tr style="cursor:pointer;" onclick="showPatientHistory(${p.id}, '${(p.name||"").replace(/'/g,"\\'")}')">
            <td><span class="td-name">${p.name || "-"}</span><div class="td-sub">${p.email || ""}</div></td>
            <td>
                <button class="action-btn primary">
                    <i class="fas fa-eye"></i> View Records
                </button>
            </td>
        </tr>
    `).join("");
}

function renderPrescriptions(rxList) {
    const tbody = document.getElementById("docRxBody");
    if (!tbody) return;
    if (!rxList.length) { renderEmptyRow("docRxBody", 4, "No prescriptions written yet."); return; }
    tbody.innerHTML = rxList.map(rx => {
        const patient = docState.patients.find(p => p.id == rx.patientId);
        const patientLabel = patient ? patient.name : `Patient #${rx.patientId}`;
        return `
        <tr>
            <td><span class="td-name">${patientLabel}</span><div class="td-sub">ID: ${rx.patientId}</div></td>
            <td><strong style="color:#f8fafc;">${rx.diagnosis || "-"}</strong></td>
            <td style="max-width:260px;white-space:pre-wrap;color:#94a3b8;">${rx.prescription || "-"}</td>
            <td>${rx.date || "-"}</td>
        </tr>`;
    }).join("");
}

// =========================
// APPOINTMENT ACTIONS
// =========================
function apptActions(a) {
    if (a.status === "PENDING") {
        return `
            <button class="action-btn approve" onclick="docApprove(${a.id})">
                <i class="fas fa-check"></i> Approve
            </button>
            <button class="action-btn reject" onclick="docReject(${a.id})" style="margin-left:6px;">
                <i class="fas fa-xmark"></i> Reject
            </button>
        `;
    }
    if (a.status === "CONFIRMED") {
        return `
            <button class="action-btn" style="background:rgba(124,92,255,0.15);color:#7c5cff;border-color:rgba(124,92,255,0.35);margin-bottom:4px;"
                onclick="openRxFromAppt(${a.id})">
                <i class="fas fa-stethoscope"></i> Treat &amp; Prescribe
            </button>
            <br>
            <button class="action-btn" style="background:rgba(24,184,137,0.12);color:#18b889;border-color:rgba(24,184,137,0.3);"
                onclick="docComplete(${a.id})">
                <i class="fas fa-flag-checkered"></i> Mark Complete
            </button>
        `;
    }
    if (a.status === "COMPLETED") {
        return `
            <button class="action-btn" style="background:rgba(19,148,235,0.1);color:#1394eb;border-color:rgba(19,148,235,0.2);"
                onclick="viewPatientRx(${a.patientId}, '${(a.patientName||"").replace(/'/g,"\\'")}')">
                <i class="fas fa-eye"></i> View Rx
            </button>
        `;
    }
    if (a.status === "REJECTED") {
        return `<span class="td-sub" style="color:#ef4444;"><i class="fas fa-xmark-circle"></i> Rejected</span>`;
    }
    return `<span class="td-sub">${a.status || "-"}</span>`;
}

// Opens treatment modal with data from the appointment cache
function openRxFromAppt(apptId) {
    const a = _apptCache[apptId];
    if (!a) {
        showToast("Appointment data not found. Please refresh.", "error");
        return;
    }
    const info = {
        phone:          a.patientPhone    || "",
        gender:         a.patientGender   || "",
        bloodGroup:     a.patientBloodGroup || "",
        email:          a.patientEmail    || "",
        appointmentTime: a.appointmentTime,
        notes:          a.notes           || "",
        paymentStatus:  a.paymentStatus   || "UNPAID"
    };
    openRxModal(a.patientId, a.patientName, apptId, info);
}

// View completed appointment's prescriptions
function viewPatientRx(patientId, patientName) {
    showPatientHistory(patientId, patientName);
}

async function docApprove(id) {
    const btn = event?.currentTarget;
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>'; }
    try {
        const res = await fetch(`${API}/api/doctor/appointments/${id}/approve`, { method: "PUT" });
        if (!res.ok) throw new Error("Failed to approve");
        showToast("Appointment confirmed ✓ Patient will be notified.", "success");
        loadDocOverview();
        loadDocAppointments();
    } catch (err) {
        showToast(err.message, "error");
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-check"></i> Approve'; }
    }
}

async function docReject(id) {
    if (!confirm("Reject this appointment? The patient will need to re-book.")) return;
    try {
        const res = await fetch(`${API}/api/doctor/appointments/${id}/reject`, { method: "PUT" });
        if (!res.ok) throw new Error("Failed to reject");
        showToast("Appointment rejected.", "success");
        loadDocOverview();
        loadDocAppointments();
    } catch (err) { showToast(err.message, "error"); }
}

async function docComplete(id) {
    if (!confirm("Mark this appointment as Completed?")) return;
    try {
        const res = await fetch(`${API}/api/doctor/appointments/${id}/complete`, { method: "PUT" });
        if (!res.ok) throw new Error("Failed to mark complete");
        showToast("Appointment marked as completed ✓", "success");
        loadDocOverview();
        loadDocAppointments();
    } catch (err) { showToast(err.message, "error"); }
}

// =========================
// PATIENT HISTORY
// =========================
function showPatientHistory(patientId, patientName) {
    switchDocSection("history");
    const title = document.getElementById("patientHistoryTitle");
    const container = document.getElementById("patientHistoryRecords");
    if (title) title.textContent = `Prescriptions: ${patientName || "Patient #" + patientId}`;
    if (container) container.innerHTML = `<p style="color:#94a3b8;"><i class="fas fa-spinner fa-spin"></i> Loading records...</p>`;
    loadPatientHistory(patientId, patientName);
}

// =========================
// TREATMENT WORKSPACE MODAL
// =========================

/**
 * openRxModal(patientId, patientName, appointmentId, appointmentInfo)
 * - patientId: required
 * - patientName: optional display name
 * - appointmentId: optional — if provided, shows "Mark as Complete" checkbox
 * - appointmentInfo: optional object { phone, gender, bloodGroup, appointmentTime, notes, paymentStatus }
 */
function openRxModal(patientId, patientName, appointmentId, appointmentInfo) {
    // Reset form
    document.getElementById("rxDiagnosis").value = "";
    document.getElementById("rxNotes").value = "";
    document.getElementById("rxPatientId").value = patientId || "";
    document.getElementById("rxAppointmentId").value = appointmentId || "";

    const manualSection  = document.getElementById("rxManualPatientInput");
    const summarySection = document.getElementById("rxPatientSummary");
    const completeSection= document.getElementById("rxCompleteSection");
    const rxMarkComplete = document.getElementById("rxMarkComplete");
    if (rxMarkComplete) rxMarkComplete.checked = false;

    if (patientId && patientName) {
        // Opened from appointment — show rich patient summary
        manualSection.style.display  = "none";
        summarySection.style.display = "block";

        // Build patient info HTML
        let html = `<div style="font-size:1rem;font-weight:700;color:#f8fafc;margin-bottom:10px;">
            <i class="fas fa-user-circle" style="color:#7c5cff;margin-right:8px;"></i>${patientName}
        </div>`;

        if (appointmentInfo) {
            html += `<div style="display:flex;flex-wrap:wrap;gap:10px;font-size:0.82rem;color:#94a3b8;margin-bottom:10px;">`;
            if (appointmentInfo.phone)     html += `<span><i class="fas fa-phone" style="color:#475569;margin-right:4px;width:14px;"></i>${appointmentInfo.phone}</span>`;
            if (appointmentInfo.email)     html += `<span><i class="fas fa-envelope" style="color:#475569;margin-right:4px;width:14px;"></i>${appointmentInfo.email}</span>`;
            if (appointmentInfo.gender)    html += `<span><i class="fas fa-user" style="color:#475569;margin-right:4px;width:14px;"></i>${appointmentInfo.gender}</span>`;
            if (appointmentInfo.bloodGroup)html += `<span><i class="fas fa-droplet" style="color:#ef4444;margin-right:4px;width:14px;"></i>${appointmentInfo.bloodGroup}</span>`;
            if (appointmentInfo.appointmentTime) html += `<span><i class="fas fa-calendar-day" style="color:#1394eb;margin-right:4px;width:14px;"></i>${formatDT(appointmentInfo.appointmentTime)}</span>`;
            html += `</div>`;

            // Payment status
            const paid = appointmentInfo.paymentStatus === "PAID";
            html += `<div style="margin-bottom:8px;">${paymentBadge(appointmentInfo.paymentStatus)}</div>`;

            // Symptoms / reason for visit
            if (appointmentInfo.notes) {
                html += `<div style="background:rgba(124,92,255,0.08);border:1px solid rgba(124,92,255,0.2);border-radius:8px;padding:10px 12px;font-size:0.83rem;">
                    <div style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#7c5cff;margin-bottom:4px;">
                        <i class="fas fa-notes-medical"></i> Symptoms / Reason for Visit
                    </div>
                    <div style="color:#e2e8f0;">${appointmentInfo.notes}</div>
                </div>`;
            }
        }

        document.getElementById("rxPatientDetails").innerHTML = html;
    } else {
        // Opened from Patients section — manual patient ID entry
        manualSection.style.display  = "block";
        summarySection.style.display = "none";
        const input = document.getElementById("rxPatientIdInput");
        if (input) { input.value = patientId || ""; }
    }

    // Show "Mark Complete" section only if appointmentId is available
    if (appointmentId && completeSection) {
        completeSection.style.display = "block";
    } else if (completeSection) {
        completeSection.style.display = "none";
    }

    const modal = document.getElementById("rxModal");
    if (modal) modal.classList.add("open");
}

function closeRxModal() {
    const modal = document.getElementById("rxModal");
    if (modal) modal.classList.remove("open");
}

async function submitPrescription() {
    // Get patient ID — either from hidden field (auto) or manual input
    const hiddenId  = document.getElementById("rxPatientId").value;
    const manualId  = document.getElementById("rxPatientIdInput")?.value;
    const patientId = parseInt(hiddenId || manualId, 10);

    const appointmentId  = document.getElementById("rxAppointmentId").value;
    const diagnosis      = document.getElementById("rxDiagnosis").value.trim();
    const notes          = document.getElementById("rxNotes").value.trim();
    const markComplete   = document.getElementById("rxMarkComplete")?.checked && appointmentId;

    if (!patientId) {
        showToast("Patient ID is required.", "error");
        return;
    }
    if (!diagnosis) {
        showToast("Please enter a diagnosis.", "error");
        return;
    }
    if (!notes) {
        showToast("Please enter the prescription / treatment notes.", "error");
        return;
    }

    const submitBtn = document.querySelector("#rxModal .action-btn.primary");
    if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; }

    try {
        // 1. Save prescription
        const rxRes = await fetch(`${API}/api/doctor/${doctorId}/prescription`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patientId, diagnosis, prescription: notes })
        });
        if (!rxRes.ok) throw new Error("Failed to save prescription");

        // 2. Optionally mark appointment as complete
        if (markComplete) {
            const completeRes = await fetch(`${API}/api/doctor/appointments/${appointmentId}/complete`, { method: "PUT" });
            if (!completeRes.ok) {
                showToast("Prescription saved, but couldn't mark complete. Do it manually.", "error");
            } else {
                showToast("Prescription saved & appointment completed ✓", "success");
            }
        } else {
            showToast("Prescription saved successfully ✓", "success");
        }

        closeRxModal();
        loadDocPrescriptions();
        if (markComplete) {
            loadDocOverview();
            loadDocAppointments();
        }
    } catch (err) {
        showToast(err.message, "error");
    } finally {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Save Prescription'; }
    }
}

// =========================
// HELPERS
// =========================
function filterDocTable(tbodyId, query) {
    document.querySelectorAll(`#${tbodyId} tr`).forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(query.toLowerCase()) ? "" : "none";
    });
}

function paymentBadge(status) {
    if (status === "PAID") {
        return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.72rem;font-weight:600;background:rgba(24,184,137,0.12);color:#18b889;">
            <i class="fas fa-check-circle" style="font-size:9px;"></i> Paid</span>`;
    }
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.72rem;font-weight:600;background:rgba(245,158,11,0.1);color:#f59e0b;">
        <i class="fas fa-clock" style="font-size:9px;"></i> Unpaid</span>`;
}

function badgeHtml(status) {
    const map = {
        CONFIRMED: ["badge-confirmed", "Confirmed"],
        REJECTED:  ["badge-rejected",  "Rejected"],
        COMPLETED: ["badge-completed", "Completed"],
        PENDING:   ["badge-pending",   "Pending"]
    };
    const [cls, label] = map[status] || ["badge-pending", status || "Pending"];
    return `<span class="badge-status ${cls}"><i class="fas fa-circle" style="font-size:5px;"></i> ${label}</span>`;
}

function formatDT(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleString("en-IN", { year:"numeric", month:"short", day:"numeric", hour:"2-digit", minute:"2-digit" });
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
}

function renderEmptyRow(tbodyId, cols, msg) {
    const tbody = document.getElementById(tbodyId);
    if (tbody) tbody.innerHTML = `<tr><td colspan="${cols}" class="data-empty">${msg}</td></tr>`;
}

function showToast(msg, type = "success") {
    let t = document.getElementById("toast");
    if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
    const icon = type === "success" ? "check-circle" : "exclamation-circle";
    t.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
    t.className = "toast " + type;
    setTimeout(() => t.className = "toast", 3800);
}
