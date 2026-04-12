function getStoredName() {
    return (localStorage.getItem('name') || '').trim();
}

function getStoredRole() {
    return (localStorage.getItem('role') || '').trim().toUpperCase();
}

function getInitials(name) {
    if (!name) return 'NA';
    const parts = name.split(/\s+/).filter(Boolean).slice(0, 2);
    return parts.map(part => part[0].toUpperCase()).join('');
}

function getFirstName(name) {
    if (!name) return '';
    return name.split(/\s+/).filter(Boolean)[0] || '';
}

function formatRole(role) {
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'DOCTOR') return 'Doctor';
    if (role === 'PATIENT') return 'Patient';
    return role || 'User';
}

function clearStoredSession() {
    ['token', 'userId', 'name', 'email', 'role'].forEach(key => localStorage.removeItem(key));
}

function bindLogoutLinks() {
    document.querySelectorAll('.logout-bg').forEach(link => {
        link.addEventListener('click', () => {
            clearStoredSession();
        });
    });
}

function applySessionUi() {
    const name = getStoredName() || 'Guest User';
    const role = getStoredRole();

    document.querySelectorAll('[data-user-name]').forEach(el => {
        el.textContent = name;
    });

    document.querySelectorAll('[data-user-role]').forEach(el => {
        el.textContent = formatRole(role);
    });

    document.querySelectorAll('[data-user-initials]').forEach(el => {
        el.textContent = getInitials(name);
    });

    document.querySelectorAll('[data-user-first-name]').forEach(el => {
        el.textContent = getFirstName(name);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    bindLogoutLinks();
    applySessionUi();
});
