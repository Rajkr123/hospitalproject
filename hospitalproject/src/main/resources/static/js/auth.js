// auth.js — Login and Register handlers

function handleLogin(e) {
    if (e) e.preventDefault();

    const btn      = document.getElementById("loginBtn");
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) { showToast("Please fill in all fields.", "error"); return; }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    btn.disabled  = true;

    fetch("http://localhost:8083/api/users/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error || "Invalid credentials"); });
        return res.json();
    })
    .then(data => {
        // Save full session in localStorage
        localStorage.setItem("token",  data.token);
        localStorage.setItem("userId", data.id);
        localStorage.setItem("name",   data.name);
        localStorage.setItem("email",  data.email);
        localStorage.setItem("role",   data.role);

        showToast("Login successful! Redirecting...", "success");

        setTimeout(() => {
            const role = data.role;
            if      (role === "ADMIN")   window.location.href = "admin-dashboard.html";
            else if (role === "DOCTOR")  window.location.href = "doctor-dashboard.html";
            else                         window.location.href = "patient-dashboard.html";
        }, 900);
    })
    .catch(err => {
        showToast(err.message, "error");
        btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        btn.disabled  = false;
    });
}

function handleRegister(e) {
    if (e) e.preventDefault();

    const btn      = document.getElementById("regBtn");
    const name     = document.getElementById("name").value.trim();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const role     = document.getElementById("role").value;

    if (!name || !email || !password || !role) { showToast("Please fill in all fields.", "error"); return; }

    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    btn.disabled  = true;

    fetch("http://localhost:8083/api/users/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, email, password, role: role.toUpperCase() })
    })
    .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error || "Registration failed"); });
        return res.json();
    })
    .then(data => {
        showToast("Account created! Please log in.", "success");
        setTimeout(() => window.location.href = "login.html", 1200);
    })
    .catch(err => {
        showToast(err.message, "error");
        btn.innerHTML = '<i class="fas fa-user-plus"></i> Create Account';
        btn.disabled  = false;
    });
}

// Shared toast (also defined in api.js, safe to call from here too)
function showToast(msg, type = "success") {
    let toast = document.getElementById("toast");
    if (!toast) { toast = document.createElement("div"); toast.id = "toast"; document.body.appendChild(toast); }
    const icon = type === "success" ? "check-circle" : "exclamation-circle";
    toast.innerHTML = `<i class="fas fa-${icon}"></i> ${msg}`;
    toast.className = "toast " + type;
    setTimeout(() => toast.className = "toast", 3800);
}

function togglePw(el) {
    const input = el.closest('.input-wrapper').querySelector('input');
    const icon  = el.querySelector('i');
    input.type  = input.type === 'password' ? 'text' : 'password';
    icon.className = input.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}