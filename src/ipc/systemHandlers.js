const { ipcMain, dialog, app } = require('electron');
const fs = require('fs');
const path = require('path');
const systemService = require('../services/systemService');

function registerSystemHandlers(getMainWindow, getDashboardWindow) {
    ipcMain.handle('get-preferences', async () => ({ success: true, preferences: systemService.getPreferences() }));
    
    ipcMain.handle('update-preferences', async (event, prefs) => {
        systemService.savePreferences(prefs);
        return { success: true };
    });

    ipcMain.handle('get-logs', async () => ({ success: true, logs: systemService.getLogs() }));

    ipcMain.handle('get-notifications', async (event, unreadOnly) => ({ success: true, notifications: systemService.getNotifications(unreadOnly) }));

    ipcMain.handle('save-csv', async (event, payload) => {
        const win = getDashboardWindow() || getMainWindow();
        const result = await dialog.showSaveDialog(win, {
            title: 'Save CSV',
            defaultPath: payload.defaultName || 'report.csv',
            filters: [{ name: 'CSV Files', extensions: ['csv'] }]
        });
        
        if (result.canceled || !result.filePath) return { success: false, canceled: true };
        
        fs.writeFileSync(result.filePath, payload.content || '', 'utf8');
        systemService.addLog('csv_export', `CSV saved: ${path.basename(result.filePath)}`, 'info');
        return { success: true, filePath: result.filePath };
    });

    ipcMain.handle('backup-data', async () => {
        const win = getMainWindow();
        const result = await dialog.showOpenDialog(win, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Backup Location'
        });
        
        if (result.canceled || result.filePaths.length === 0) return { success: false, canceled: true };
        
        const backupDir = result.filePaths[0];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFolder = path.join(backupDir, `attendance_backup_${timestamp}`);
        
        if (!fs.existsSync(backupFolder)) fs.mkdirSync(backupFolder);
        
        const files = ['admin.json', 'members.json', 'attendance.json', 'preferences.json', 'logs.json', 'notifications.json'];
        const userData = app.getPath('userData');
        
        files.forEach(f => {
            const src = path.join(userData, f);
            if (fs.existsSync(src)) fs.copyFileSync(src, path.join(backupFolder, f));
        });
        
        systemService.addLog('backup_created', `Backup created at ${backupFolder}`, 'info');
        return { success: true, path: backupFolder };
    });

    ipcMain.handle('mark-notification-as-read', async (event, id) => ({ success: systemService.markNotificationAsRead(id) }));
    
    ipcMain.handle('get-notification-stats', async () => ({ success: true, stats: systemService.getNotificationStats() }));

    ipcMain.handle('clear-old-notifications', async (event, days) => ({ success: true, cleared: systemService.clearOldNotifications(days) }));

    ipcMain.handle('get-log-stats', async () => ({ success: true, stats: systemService.getLogStats() }));

    ipcMain.handle('clear-old-logs', async (event, days) => ({ success: true, cleared: systemService.clearOldLogs(days) }));
    
    ipcMain.handle('get-system-logs', async (event, filter) => ({ success: true, logs: systemService.getLogs(filter) }));
}

module.exports = registerSystemHandlers;
