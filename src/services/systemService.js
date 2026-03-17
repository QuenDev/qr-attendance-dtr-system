const { FILES, writeJSONAtomic, readJSON } = require('../db/dbCore');

function getPreferences() {
    return readJSON(FILES.PREFERENCES, {
        grace_period_minutes: 15,
        shift_start: "08:00",
        shift_end: "17:00",
        late_threshold: "08:15",
        theme: "dark"
    });
}

function savePreferences(prefs) {
    const current = getPreferences();
    const updated = { ...current, ...prefs };
    writeJSONAtomic(FILES.PREFERENCES, updated);
}

function addLog(type, message, level = "info", relatedId = null) {
    const logs = readJSON(FILES.LOGS);
    logs.push({
        timestamp: new Date().toISOString(),
        type,
        message,
        level,
        related_id: relatedId
    });
    // Keep last 1000 logs
    if (logs.length > 1000) logs.shift();
    writeJSONAtomic(FILES.LOGS, logs);
}

function getLogs(filter = null) {
    const logs = readJSON(FILES.LOGS);
    if (!filter) return logs;
    return logs.filter(l => l.type === filter || l.level === filter);
}

function addNotification(type, title, message, relatedMember = null) {
    const notifications = readJSON(FILES.NOTIFICATIONS);
    const notification = {
        id: Date.now(),
        type,
        title,
        message,
        related_member: relatedMember,
        read: false,
        timestamp: new Date().toISOString()
    };
    notifications.push(notification);
    writeJSONAtomic(FILES.NOTIFICATIONS, notifications);
    return notification;
}

function getNotifications(unreadOnly = false) {
    const notifications = readJSON(FILES.NOTIFICATIONS);
    return unreadOnly ? notifications.filter(n => !n.read) : notifications;
}

function markNotificationAsRead(id) {
    const notifications = readJSON(FILES.NOTIFICATIONS);
    const n = notifications.find(n => n.id === id);
    if (n) {
        n.read = true;
        writeJSONAtomic(FILES.NOTIFICATIONS, notifications);
        return true;
    }
    return false;
}

function getNotificationStats() {
    const notifications = readJSON(FILES.NOTIFICATIONS);
    return {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length
    };
}

function clearOldNotifications(days) {
    let notifications = readJSON(FILES.NOTIFICATIONS);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const initial = notifications.length;
    notifications = notifications.filter(n => new Date(n.timestamp) > cutoff);
    writeJSONAtomic(FILES.NOTIFICATIONS, notifications);
    return initial - notifications.length;
}

function getLogStats() {
    const logs = readJSON(FILES.LOGS);
    return {
        total: logs.length,
        errors: logs.filter(l => l.level === 'error').length,
        warnings: logs.filter(l => l.level === 'warning').length
    };
}

function clearOldLogs(days) {
    let logs = readJSON(FILES.LOGS);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const initial = logs.length;
    logs = logs.filter(l => new Date(l.timestamp) > cutoff);
    writeJSONAtomic(FILES.LOGS, logs);
    return initial - logs.length;
}

module.exports = {
    getPreferences,
    savePreferences,
    addLog,
    getLogs,
    addNotification,
    getNotifications,
    markNotificationAsRead,
    getNotificationStats,
    clearOldNotifications,
    getLogStats,
    clearOldLogs
};
