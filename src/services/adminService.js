const { FILES, writeJSONAtomic, readJSON } = require('./dbCore');
const bcryptjs = require('bcryptjs');

function getAllAdmins() {
    return readJSON(FILES.ADMIN).map(a => ({
        id: a.id,
        username: a.username,
        date_created: a.date_created
    }));
}

async function addAdmin(username, password) {
    const adminStore = readJSON(FILES.ADMIN);
    if (adminStore.find(a => a.username === username)) {
        throw new Error(`Admin '${username}' already exists`);
    }
    
    const hashed = await bcryptjs.hash(password, 10);
    adminStore.push({
        id: adminStore.length > 0 ? Math.max(...adminStore.map(a => a.id)) + 1 : 1,
        username,
        password: hashed,
        date_created: new Date().toISOString()
    });
    
    writeJSONAtomic(FILES.ADMIN, adminStore);
}

async function verifyAdmin(username, password) {
    const adminStore = readJSON(FILES.ADMIN);
    const admin = adminStore.find(a => a.username === username);
    if (!admin) return null;
    
    const match = await bcryptjs.compare(password, admin.password);
    return match ? { id: admin.id, username: admin.username } : null;
}

function deleteAdmin(adminId) {
    let adminStore = readJSON(FILES.ADMIN);
    const initialLength = adminStore.length;
    adminStore = adminStore.filter(a => a.id !== adminId);
    
    if (adminStore.length < initialLength) {
        writeJSONAtomic(FILES.ADMIN, adminStore);
        return true;
    }
    return false;
}

async function updateAdminPassword(adminId, newPassword) {
    const adminStore = readJSON(FILES.ADMIN);
    const admin = adminStore.find(a => a.id === adminId);
    if (!admin) return false;
    
    admin.password = await bcryptjs.hash(newPassword, 10);
    writeJSONAtomic(FILES.ADMIN, adminStore);
    return true;
}

module.exports = {
    getAllAdmins,
    addAdmin,
    verifyAdmin,
    deleteAdmin,
    updateAdminPassword
};
