const { ipcMain } = require('electron');
const adminService = require('../services/adminService');
const systemService = require('../services/systemService');

function registerAdminHandlers() {
    ipcMain.handle('verify-admin', async (event, username, password) => {
        try {
            const admin = await adminService.verifyAdmin(username, password);
            if (admin) {
                systemService.addLog('admin_login', `Admin '${username}' logged in`, 'info', admin.id);
                systemService.addNotification('success', 'Login Successful', `Admin '${username}' logged in`, null);
                return { id: admin.id, username: admin.username };
            }
            systemService.addLog('admin_login_failed', `Failed login for '${username}'`, 'warning');
            return null;
        } catch (error) {
            systemService.addLog('admin_login_error', `Error for '${username}': ${error.message}`, 'error');
            throw error;
        }
    });

    ipcMain.handle('get-all-admins', async () => adminService.getAllAdmins());
    
    ipcMain.handle('add-admin', async (event, username, password) => {
        await adminService.addAdmin(username, password);
        systemService.addLog('admin_added', `Admin '${username}' created`, 'info');
        return { success: true };
    });

    ipcMain.handle('delete-admin', async (event, adminId) => {
        const success = adminService.deleteAdmin(adminId);
        if (success) systemService.addLog('admin_deleted', `Admin #${adminId} deleted`, 'warning');
        return { success };
    });

    ipcMain.handle('update-admin-password', async (event, adminId, newPassword) => {
        const success = await adminService.updateAdminPassword(adminId, newPassword);
        if (success) systemService.addLog('admin_password_changed', `Admin #${adminId} password updated`, 'info');
        return { success };
    });
}

module.exports = registerAdminHandlers;
