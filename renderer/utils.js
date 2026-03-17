// Shared utility functions for the QR Attendance DTR System

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 * @param {number} duration - Duration in milliseconds
 * @param {string} qrCodeText - Optional QR code text to display
 * @param {string} containerId - ID of the container element
 */
function showToast(message, type = "success", duration = 2500, qrCodeText, containerId = "toast-container") {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add specific styles based on type if not handled by CSS
    if (type === 'error') toast.style.borderColor = 'var(--error)';
    if (type === 'warning') toast.style.borderColor = 'var(--warning)';
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = "toastOut 0.25s forwards";
        setTimeout(() => toast.remove(), 250);
    }, duration);
}

/**
 * Update current time and date in the UI
 * @param {string} timeId - ID of the time element
 * @param {string} dateId - ID of the date element
 */
function updateDateTime(timeId = "currentTime", dateId = "currentDate") {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit" 
    });
    const date = now.toLocaleDateString("en-US", { 
        weekday: "short", 
        month: "short", 
        day: "numeric",
        year: "numeric"
    });
    
    const timeEl = document.getElementById(timeId);
    const dateEl = document.getElementById(dateId);
    
    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
}

/**
 * Get local date in YYYY-MM-DD format
 * @param {Date} date - Date object
 * @returns {string}
 */
function getLocalDateYMD(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        updateDateTime,
        getLocalDateYMD
    };
}
