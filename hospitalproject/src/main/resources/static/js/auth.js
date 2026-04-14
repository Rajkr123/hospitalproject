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
        if (!res.ok) {
            return res.json().then(errBody => {
                if (errBody.error === "PENDING_APPROVAL") {
                    showPendingApprovalModal();
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                    btn.disabled = false;
                    return null;
                }
                if (errBody.error === "ACCOUNT_REJECTED") {
                    showToast("Your doctor account was rejected by the admin. Contact support.", "error");
                    btn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                    btn.disabled = false;
                    return null;
                }
                throw new Error(errBody.error || errBody.message || "Invalid credentials");
            });
        }
        return res.json();
    })
    .then(data => {
        if (!data || !data.token) return;

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

// Shared toast
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

function showPendingApprovalModal() {
    const existing = document.getElementById('pendingModal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'pendingModal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.65);backdrop-filter:blur(8px);';
    modal.innerHTML = `
        <div style="background:#0f1f38;border:1px solid rgba(245,158,11,0.35);border-radius:24px;padding:44px 38px;max-width:460px;width:92%;text-align:center;box-shadow:0 40px 100px rgba(0,0,0,0.6);">
            <div style="width:70px;height:70px;border-radius:50%;background:rgba(245,158,11,0.12);display:flex;align-items:center;justify-content:center;margin:0 auto 22px;font-size:2rem;color:#f59e0b;border:2px solid rgba(245,158,11,0.3);">
                <i class="fas fa-hourglass-half"></i>
            </div>
            <h2 style="font-size:1.45rem;font-weight:800;color:#f0f6ff;margin-bottom:12px;letter-spacing:-0.03em;">Account Pending Approval</h2>
            <p style="color:rgba(240,246,255,0.65);font-size:0.94rem;line-height:1.75;margin-bottom:22px;">
                Your doctor registration was submitted successfully.<br>
                The <strong style="color:#f0f6ff;">administrator</strong> needs to review and approve your profile before you can access the doctor dashboard.
            </p>
            <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.2);border-radius:14px;padding:14px 18px;margin-bottom:26px;text-align:left;display:flex;gap:10px;align-items:flex-start;">
                <i class="fas fa-info-circle" style="color:#f59e0b;margin-top:3px;flex-shrink:0;font-size:0.95rem;"></i>
                <span style="color:rgba(240,246,255,0.72);font-size:0.85rem;line-height:1.65;">Try logging in again after the admin approves your account. You will then be redirected to your doctor dashboard.</span>
            </div>
            <button onclick="document.getElementById('pendingModal').remove()" style="background:linear-gradient(135deg,#1e8cfa,#0a6dd5);color:#fff;border:none;border-radius:14px;padding:13px 32px;font-size:0.96rem;font-weight:700;cursor:pointer;width:100%;letter-spacing:-0.01em;">
                <i class="fas fa-check"></i>&nbsp; Got it
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}