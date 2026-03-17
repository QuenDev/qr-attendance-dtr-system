const { ipcMain } = require('electron');
const memberService = require('../services/memberService');
const systemService = require('../services/systemService');

function registerMemberHandlers() {
    ipcMain.handle('get-all-members', async () => ({ success: true, members: memberService.getAllMembers() }));

    ipcMain.handle('get-member', async (event, id) => {
        const member = memberService.getMemberById(id);
        return member ? { success: true, member } : { success: false, error: 'Member not found' };
    });

    ipcMain.handle('get-member-by-qr', async (event, qrCode) => {
        const member = memberService.getMemberByQRCode(qrCode);
        return member ? { success: true, member } : { success: false, error: 'Member not found' };
    });

    ipcMain.handle('add-member', async (event, memberData) => {
        try {
            const member = memberService.addMember(memberData.first_name, memberData.last_name);
            systemService.addLog('member_added', `Member '${member.first_name} ${member.last_name}' added`, 'info', member.id);
            return { success: true, member };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('update-member', async (event, id, updates) => {
        try {
            const member = memberService.updateMember(id, updates);
            systemService.addLog('member_updated', `Member '${member.first_name} ${member.last_name}' updated`, 'info', id);
            return { success: true, member };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('delete-member', async (event, id) => {
        const success = memberService.deleteMember(id);
        if (success) systemService.addLog('member_deleted', `Member #${id} deleted`, 'warning', id);
        return { success };
    });

    ipcMain.handle('deactivate-qr', async (event, id) => {
        const member = memberService.setQRCodeStatus(id, false);
        systemService.addLog('qr_deactivated', `QR for ${member.first_name} deactivated`, 'warning', id);
        return { success: true, member };
    });

    ipcMain.handle('reactivate-qr', async (event, id) => {
        const member = memberService.setQRCodeStatus(id, true);
        systemService.addLog('qr_reactivated', `QR for ${member.first_name} reactivated`, 'info', id);
        return { success: true, member };
    });
}

module.exports = registerMemberHandlers;
