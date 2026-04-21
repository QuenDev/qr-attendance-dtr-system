const { FILES, writeJSONAtomic, readJSON } = require('../db/dbCore');
const memberService = require('./memberService');
const { getLocalDateYMD } = require('../shared/utils');

function getAttendanceByDate(date) {
    const attendance = readJSON(FILES.ATTENDANCE);
    return attendance.filter(a => a.date === date);
}

function getAttendanceByMember(memberId, startDate, endDate) {
    let records = readJSON(FILES.ATTENDANCE).filter(a => String(a.member_id) === String(memberId));
    if (startDate) records = records.filter(a => a.date >= startDate);
    if (endDate) records = records.filter(a => a.date <= endDate);
    return records;
}

function checkIn(memberId) {
    const member = memberService.getMemberById(memberId);
    if (!member) throw new Error('Member not found');
    if (!member.qr_active) throw new Error('QR code is deactivated');

    const today = getLocalDateYMD();
    const now = new Date();
    const sessionType = now.getHours() < 12 ? 'morning' : 'afternoon';

    const attendanceStore = readJSON(FILES.ATTENDANCE);
    let attendance = attendanceStore.find(a => a.member_id === memberId && a.date === today);

    if (!attendance) {
        attendance = {
            id: attendanceStore.length > 0 ? Math.max(...attendanceStore.map(a => a.id)) + 1 : 1,
            member_id: memberId,
            date: today,
            sessions: []
        };
        attendanceStore.push(attendance);
    }

    if (attendance.sessions.find(s => s.session_type === sessionType)) {
        throw new Error(`Already recorded a ${sessionType} session for today`);
    }

    if (sessionType === 'afternoon' && attendance.sessions.find(s => s.session_type === 'morning' && !s.check_out)) {
        throw new Error('Please time out from morning session first');
    }

    const newSession = {
        session_type: sessionType,
        check_in: now.toISOString(),
        check_out: null
    };
    attendance.sessions.push(newSession);
    writeJSONAtomic(FILES.ATTENDANCE, attendanceStore);
    
    return { member, timestamp: newSession.check_in, session_type: sessionType };
}

function checkOut(memberId) {
    const today = getLocalDateYMD();
    const now = new Date();
    const attendanceStore = readJSON(FILES.ATTENDANCE);
    const attendance = attendanceStore.find(a => a.member_id === memberId && a.date === today);

    if (!attendance) throw new Error('No attendance record found for today');

    const currentSessionType = now.getHours() < 12 ? 'morning' : 'afternoon';
    let session = attendance.sessions.find(s => s.session_type === currentSessionType && !s.check_out);
    
    if (!session) {
        session = attendance.sessions.find(s => !s.check_out);
    }

    if (!session) {
        // Handle potential re-checkout within cooldown
        const lastCompleted = attendance.sessions.filter(s => s.check_out).pop();
        if (lastCompleted) {
            const diffMin = (now - new Date(lastCompleted.check_out)) / (1000 * 60);
            if (diffMin < 5) {
                return { success: false, cooldown: true, lastCompleted };
            }
            // Overwrite last checkout if outside cooldown
            session = lastCompleted;
        } else {
            throw new Error('No active session found');
        }
    }

    session.check_out = now.toISOString();
    const hours = (new Date(session.check_out) - new Date(session.check_in)) / (1000 * 60 * 60);
    session.working_hours = parseFloat(hours.toFixed(2));
    
    // Update total hours and status
    attendance.total_working_hours = parseFloat(attendance.sessions.reduce((sum, s) => sum + (s.working_hours || 0), 0).toFixed(2));
    
    // Status Logic (simplified for brevity, can be refined)
    const sessionsDone = attendance.sessions.filter(s => s.check_out).length;
    // Logic from original: late if after 8:15 or 1:15
    const isLate = attendance.sessions.some(s => {
        const t = new Date(s.check_in);
        return (s.session_type === 'morning' && (t.getHours() > 8 || (t.getHours() === 8 && t.getMinutes() > 15))) ||
               (s.session_type === 'afternoon' && (t.getHours() > 13 || (t.getHours() === 13 && t.getMinutes() > 15)));
    });

    if (sessionsDone === 2) attendance.status = isLate ? 'late' : 'present';
    else if (sessionsDone === 1) attendance.status = isLate ? 'late' : 'half-day';

    writeJSONAtomic(FILES.ATTENDANCE, attendanceStore);
    return { success: true, session_type: session.session_type, session_hours: session.working_hours, total_hours: attendance.total_working_hours, status: attendance.status };
}

function getTodayAttendanceSummary() {
    const today = getLocalDateYMD();
    const todayAttendance = getAttendanceByDate(today);
    const allMembers = memberService.getAllMembers();
    
    const checkedInMembers = new Set();
    todayAttendance.forEach(a => {
        if (a.sessions.some(s => s.check_in)) checkedInMembers.add(a.member_id);
    });

    const stillCheckedIn = todayAttendance.filter(a => 
        a.sessions.some(s => s.check_in && !s.check_out)
    ).length;

    return {
        date: today,
        total_members: allMembers.length,
        checked_in: checkedInMembers.size,
        checked_in_count: checkedInMembers.size, // backward compatibility
        still_checked_in: stillCheckedIn,
        records: todayAttendance
    };
}

function getMonthlyAttendanceTrends() {
    const records = readJSON(FILES.ATTENDANCE);
    const trends = {};
    records.forEach(r => {
        const month = r.date.substring(0, 7);
        trends[month] = (trends[month] || 0) + 1;
    });
    return Object.entries(trends).map(([month, count]) => ({ month, count }));
}

function getTopAttendees(limit = 5) {
    const records = readJSON(FILES.ATTENDANCE);
    const counts = {};
    records.forEach(r => {
        counts[r.member_id] = (counts[r.member_id] || 0) + 1;
    });
    // This needs member details, we'll handle that in the handler or inject memberService
    return Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit);
}

function getCurrentlyCheckedIn() {
    const today = getLocalDateYMD();
    const records = readJSON(FILES.ATTENDANCE);
    return records.filter(r => r.date === today && r.sessions.some(s => s.check_in && !s.check_out));
}

function getMemberActiveSession(memberId) {
    const today = getLocalDateYMD();
    const records = readJSON(FILES.ATTENDANCE);
    const record = records.find(r => String(r.member_id) === String(memberId) && r.date === today);
    if (!record) return null;
    return record.sessions.find(s => s.check_in && !s.check_out) || null;
}

function getMemberAttendanceToday(memberId) {
    const today = getLocalDateYMD();
    const records = readJSON(FILES.ATTENDANCE);
    return records.find(r => String(r.member_id) === String(memberId) && r.date === today) || null;
}

function markAbsentForDay(date) {
    const attendanceStore = readJSON(FILES.ATTENDANCE);
    const membersStore = readJSON(FILES.MEMBERS);
    const markedMembers = [];

    membersStore.forEach(member => {
        const hasCheckIn = attendanceStore.some(a => a.member_id === member.id && a.date === date && a.sessions.length > 0);
        if (!hasCheckIn) {
            const existing = attendanceStore.find(a => a.member_id === member.id && a.date === date);
            if (!existing) {
                attendanceStore.push({
                    id: attendanceStore.length > 0 ? Math.max(...attendanceStore.map(a => a.id)) + 1 : 1,
                    member_id: member.id,
                    date: date,
                    sessions: [],
                    status: "absent",
                    total_working_hours: 0
                });
                markedMembers.push(member.id);
            }
        }
    });

    if (markedMembers.length > 0) {
        writeJSONAtomic(FILES.ATTENDANCE, attendanceStore);
    }
    return { marked: markedMembers.length, members: markedMembers };
}

function normalizeAttendanceToDTR(attendance) {
    const rows = [];
    attendance.sessions.forEach(session => {
        rows.push({
            member_id: attendance.member_id,
            date: attendance.date,
            session: session.session_type === "morning" ? "AM" : "PM",
            time_in: session.check_in ?? null,
            time_out: session.check_out ?? null,
            hours: session.working_hours ?? 0,
            status: attendance.status ?? "absent"
        });
    });
    // If absent, force 2 rows
    if (attendance.sessions.length === 0) {
        rows.push({
            member_id: attendance.member_id,
            date: attendance.date,
            session: "AM",
            time_in: null,
            time_out: null,
            hours: 0,
            status: "absent"
        }, {
            member_id: attendance.member_id,
            date: attendance.date,
            session: "PM",
            time_in: null,
            time_out: null,
            hours: 0,
            status: "absent"
        });
    }
    return rows;
}

function getDTRByDateRange(startDate, endDate, memberId) {
    const attendanceStore = readJSON(FILES.ATTENDANCE);
    let records = attendanceStore.filter(a => a.date >= startDate && a.date <= endDate);
    if (memberId) {
        records = records.filter(a => a.member_id === memberId);
    }
    return records.flatMap(normalizeAttendanceToDTR);
}

function autoCloseAttendance(date) {
    const attendanceStore = readJSON(FILES.ATTENDANCE);
    const systemService = require('./systemService');
    const prefs = systemService.getPreferences();
    const shiftEndTime = prefs.shift_end || "17:00";
    const now = new Date();
    const closedRecords = [];

    attendanceStore.forEach(attendance => {
        if (attendance.date !== date) return;
        
        let changed = false;
        attendance.sessions.forEach(session => {
            if (!session.check_out) {
                const shiftEndDateTime = new Date(date + "T" + shiftEndTime + ":00");
                const checkOutTime = new Date(Math.min(shiftEndDateTime.getTime(), now.getTime()));
                session.check_out = checkOutTime.toISOString();
                const workingMs = checkOutTime.getTime() - new Date(session.check_in).getTime();
                session.working_hours = parseFloat((workingMs / (1000 * 60 * 60)).toFixed(2));
                changed = true;
            }
        });

        if (changed) {
            attendance.total_working_hours = parseFloat(attendance.sessions.reduce((sum, s) => sum + (s.working_hours || 0), 0).toFixed(2));
            const sessionsDone = attendance.sessions.filter(s => s.check_out).length;
            // Simplified status logic for auto-close
            attendance.status = sessionsDone >= 2 ? "present" : "half-day";
            closedRecords.push(attendance);
        }
    });

    if (closedRecords.length > 0) {
        writeJSONAtomic(FILES.ATTENDANCE, attendanceStore);
    }
    return { closed: closedRecords.length, records: closedRecords };
}

module.exports = {
    getAttendanceByDate,
    getAttendanceByMember,
    checkIn,
    checkOut,
    getLocalDateYMD,
    getTodayAttendanceSummary,
    getMonthlyAttendanceTrends,
    getTopAttendees,
    getCurrentlyCheckedIn,
    getMemberActiveSession,
    getMemberAttendanceToday,
    markAbsentForDay,
    getDTRByDateRange,
    autoCloseAttendance
};
