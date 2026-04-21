const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Handlers
const registerAdminHandlers = require('./ipc/adminHandlers');
const registerMemberHandlers = require('./ipc/memberHandlers');
const registerAttendanceHandlers = require('./ipc/attendanceHandlers');
const registerSystemHandlers = require('./ipc/systemHandlers');

// State
let mainWindow = null;
let dashboardWindow = null;
let employeeScannerWindow = null;

// Common web preferences
const commonWebPrefs = { nodeIntegration: true, contextIsolation: false };

// Force single instance
if (!app.requestSingleInstanceLock()) {
    app.quit();
} else {
    app.on('second-instance', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
        }
    });
    app.whenReady().then(init);
}

async function init() {
    // Initial Data Load & Migration
    const adminService = require('./services/adminService');
    const admins = adminService.getAllAdmins();
    if (admins.length === 0) {
        await adminService.addAdmin('admin', 'admin123');
        console.log("✅ Default admin created (admin/admin123)");
    }

    createWindow();
    
    // Register Modular Handlers
    registerAdminHandlers();
    registerMemberHandlers();
    registerAttendanceHandlers();
    registerSystemHandlers(() => mainWindow, () => dashboardWindow);
    
    // Global IPC relays
    ipcMain.on('attendance-updated', (event, data) => {
        if (dashboardWindow && !dashboardWindow.isDestroyed()) {
            dashboardWindow.webContents.send('attendance-updated', data);
        }
    });

    ipcMain.on('login-success', () => {
        createDashboard();
        if (mainWindow) mainWindow.close();
    });

    ipcMain.on('logout', () => {
        if (dashboardWindow) dashboardWindow.close();
        createWindow();
    });

    ipcMain.on('open-employee-scanner', () => {
        if (employeeScannerWindow && !employeeScannerWindow.isDestroyed()) {
            employeeScannerWindow.focus();
        } else {
            createEmployeeScanner();
        }
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        icon: path.join(__dirname, '../assets/icons/dtr.ico'),
        webPreferences: commonWebPrefs
    });
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

function createDashboard() {
    dashboardWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: commonWebPrefs
    });
    dashboardWindow.loadFile(path.join(__dirname, '../renderer/dashboard.html'));
}

function createEmployeeScanner() {
    employeeScannerWindow = new BrowserWindow({
        width: 600,
        height: 900,
        webPreferences: commonWebPrefs
    });
    employeeScannerWindow.loadFile(path.join(__dirname, '../renderer/employee.html'));
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
