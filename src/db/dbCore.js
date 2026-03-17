const path = require('path');
const { app } = require('electron');

// Cache to avoid redundant disk reads
const cache = new Map();

// Use userData for persistent storage
const DATA_DIR = app.getPath('userData');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

const FILES = {
    ADMIN: path.join(DATA_DIR, 'admin.json'),
    MEMBERS: path.join(DATA_DIR, 'members.json'),
    ATTENDANCE: path.join(DATA_DIR, 'attendance.json'),
    PREFERENCES: path.join(DATA_DIR, 'preferences.json'),
    LOGS: path.join(DATA_DIR, 'logs.json'),
    NOTIFICATIONS: path.join(DATA_DIR, 'notifications.json')
};

/**
 * Safe JSON write utility with caching
 */
function writeJSONAtomic(filePath, data) {
    try {
        const fs = require('fs');
        const tmp = filePath + '.tmp';
        fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
        fs.renameSync(tmp, filePath);
        cache.set(filePath, data); // Update cache
    } catch (err) {
        console.error(`Error writing file ${filePath}:`, err);
        throw err;
    }
}

/**
 * Safe JSON read utility with caching
 */
function readJSON(filePath, defaultValue = []) {
    if (cache.has(filePath)) {
        return cache.get(filePath);
    }
    
    try {
        const fs = require('fs');
        if (fs.existsSync(filePath)) {
            const data = fs.readFileSync(filePath, 'utf-8');
            const parsed = JSON.parse(data);
            cache.set(filePath, parsed); // Seed cache
            return parsed;
        }
    } catch (err) {
        console.error(`Error reading file ${filePath}:`, err);
    }
    return defaultValue;
}

function clearCache() {
    cache.clear();
}

module.exports = {
    FILES,
    writeJSONAtomic,
    readJSON,
    clearCache
};
