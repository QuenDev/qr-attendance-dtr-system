const { FILES, writeJSONAtomic, readJSON } = require('../db/dbCore');
const crypto = require('crypto');

function getAllMembers() {
    return readJSON(FILES.MEMBERS);
}

function getMemberById(id) {
    const members = readJSON(FILES.MEMBERS);
    return members.find(m => m.id === id);
}

function getMemberByQRCode(qrCode) {
    const members = readJSON(FILES.MEMBERS);
    return members.find(m => m.qr_code === qrCode);
}

function addMember(firstName, lastName) {
    if (!firstName || !lastName || firstName.trim() === '' || lastName.trim() === '') {
        throw new Error('First name and last name are required');
    }
    
    const members = readJSON(FILES.MEMBERS);
    const qrCode = crypto.randomBytes(8).toString('hex').toUpperCase();
    
    const member = {
        id: members.length > 0 ? Math.max(...members.map(m => m.id)) + 1 : 1,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        qr_code: qrCode,
        qr_active: true,
        date_registered: new Date().toISOString()
    };
    
    members.push(member);
    writeJSONAtomic(FILES.MEMBERS, members);
    return member;
}

function updateMember(id, updates) {
    const members = readJSON(FILES.MEMBERS);
    const index = members.findIndex(m => m.id === id);
    if (index === -1) throw new Error(`Member with ID ${id} not found`);
    
    if (updates.first_name !== undefined && !updates.first_name.trim()) throw new Error('First name cannot be empty');
    if (updates.last_name !== undefined && !updates.last_name.trim()) throw new Error('Last name cannot be empty');
    
    members[index] = { ...members[index], ...updates };
    writeJSONAtomic(FILES.MEMBERS, members);
    return members[index];
}

function deleteMember(id) {
    let members = readJSON(FILES.MEMBERS);
    const initialLength = members.length;
    members = members.filter(m => m.id !== id);
    
    if (members.length < initialLength) {
        writeJSONAtomic(FILES.MEMBERS, members);
        return true;
    }
    return false;
}

function setQRCodeStatus(id, active) {
    const members = readJSON(FILES.MEMBERS);
    const member = members.find(m => m.id === id);
    if (!member) throw new Error('Member not found');
    
    member.qr_active = active;
    writeJSONAtomic(FILES.MEMBERS, members);
    return member;
}

module.exports = {
    getAllMembers,
    getMemberById,
    getMemberByQRCode,
    addMember,
    updateMember,
    deleteMember,
    setQRCodeStatus
};
