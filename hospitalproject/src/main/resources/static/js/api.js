// =============================================
//  api.js — Shared API utility for SmartHealth
//  Base URL: http://localhost:8083
// =============================================

const API_BASE = "http://localhost:8083";

// ── Token helpers ──────────────────────────────
function getToken()  { return localStorage.getItem("token"); }
function getUserId() { return localStorage.getItem("userId"); }
function getRole()   { return localStorage.getItem("role"); }
function getName()   { return localStorage.getItem("name"); }

// ── Generic fetch wrapper ──────────────────────
function apiRequest(path, method = "GET", body = null) {
    const opts = {
        method,
        headers: {
            "Content-Type": "application/json",
            ...(getToken() ? { "Authorization": "Bearer " + getToken() } : {})
        }
    };
    if (body) opts.body = JSON.stringify(body);
    return fetch(API_BASE + path, opts);
}

// ── Auth guard — call on protected pages ───────
function requireAuth(allowedRole) {
    const token = getToken();
    const role  = getRole();
    if (!token) {
        window.location.href = "/pages/login.html";
        return false;
    }
    if (allowedRole && role !== allowedRole) {
        alert("Access denied. You are not authorized for this page.");
        window.location.href = "/pages/login.html";
        return false;
    }
    return true;
}

// ── Logout ─────────────────────────────────────
function logout() {
    localStorage.clear();
    window.location.href = "/index.html";
}

// ── Toast helper ───────────────────────────────
function showToast(msg, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        document.body.appendChild(toast);
    }
    const icon = type === "success" ? "check-circle" : "exclamation-circle";
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
    toast.className = "toast " + type;
    setTimeout(() => toast.className = "toast", 3500);
}