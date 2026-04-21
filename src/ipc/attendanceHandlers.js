const { ipcMain } = require('electron');
const attendanceService = require('../services/attendanceService');
const systemService = require('../services/systemService');

function registerAttendanceHandlers() {
    ipcMain.handle('check-in', async (event, memberId) => {
        try {
            const result = attendanceService.checkIn(memberId);
            systemService.addLog('check_in', `${result.member.first_name} checked in (${result.session_type})`, 'info', memberId);
            systemService.addNotification('success', 'Time In', `${result.member.first_name} timed in`, memberId);
            return { success: true, ...result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('check-out', async (event, memberId) => {
        try {
            const result = attendanceService.checkOut(memberId);
            if (result.cooldown) return { success: false, error: 'Check-out ignored (cooldown)' };
            
            systemService.addLog('check_out', `Check-out (${result.session_type})`, 'info', memberId);
            return { success: true, ...result };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('get-attendance-by-date', async (event, date) => {
        return { success: true, records: attendanceService.getAttendanceByDate(date) };
    });

    ipcMain.handle('get-attendance-by-member', async (event, memberId, start, end) => {
        return { success: true, records: attendanceService.getAttendanceByMember(memberId, start, end) };
    });

    ipcMain.handle('get-member-attendance', async (event, memberId) => {
        return { success: true, attendance: attendanceService.getMemberAttendanceToday(memberId) };
    });

    ipcMain.handle('get-today-summary', async () => ({ success: true, summary: attendanceService.getTodayAttendanceSummary() }));

    ipcMain.handle('get-day-stats', async (event, memberId) => {
        const summary = attendanceService.getTodayAttendanceSummary();
        const activeSession = attendanceService.getMemberActiveSession(memberId);
        return { 
            success: true, 
            stats: { 
                check_ins: summary.checked_in_count, 
                active_members: summary.still_checked_in,
                active: !!activeSession,
                session: activeSession
            } 
        };
    });

    ipcMain.handle('get-monthly-trends', async () => ({ success: true, trends: attendanceService.getMonthlyAttendanceTrends() }));

    ipcMain.handle('get-top-attendees', async (event, limit) => {
        const top = attendanceService.getTopAttendees(limit);
        const memberService = require('../services/memberService');
        const enriched = top.map(([id, count]) => ({ member: memberService.getMemberById(Number(id)), count }));
        return { success: true, topAttendees: enriched };
    });

    ipcMain.handle('get-currently-checked-in', async () => ({ success: true, records: attendanceService.getCurrentlyCheckedIn() }));

    ipcMain.handle('get-dtr-by-date-range', async (event, startDate, endDate, memberId) => {
        return { success: true, rows: attendanceService.getDTRByDateRange(startDate, endDate, memberId) };
    });

    ipcMain.handle('mark-absent-for-day', async (event, date) => {
        const result = attendanceService.markAbsentForDay(date);
        return { success: true, ...result };
    });

    ipcMain.handle('auto-close-attendance', async (event, date) => {
        const result = attendanceService.autoCloseAttendance(date);
        return { success: true, ...result };
    });
}

module.exports = registerAttendanceHandlers;
