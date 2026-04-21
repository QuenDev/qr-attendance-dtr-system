# QR Attendance & DTR Monitoring System 🕒

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.3.0-blue.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows-lightgrey.svg)]()

A high-performance, **Local-First** Desktop Application for professional attendance tracking and Daily Time Record (DTR) management. Built with a premium **Glassmorphism** aesthetic and optimized for fast, offline-reliable data handling.

## ✨ Key Features

- **QR-Powered Attendance**: Rapid "Scan-and-Log" system for employees using unique QR identifiers.
- **Independent Session Mapping**: Intelligent tracking of **AM and PM sessions**, allowing for precise partial-day and whole-day attendance calculation.
- **Advanced DTR Logic**: Automatic calculation of working hours, lateness, undertime, and half-day status based on configurable grace periods.
- **Rich Analytics Dashboard**: Live visualization of attendance trends, top attendees, and real-time "Still-Checked-In" monitoring.
- **Admin Management Portal**: Secure access control with `bcrypt` encryption, member management, and exportable reports (PDF/CSV).
- **System Integrity**: Automated activity logs, user notifications, and a built-in backup utility to prevent data loss.

## 🏗️ Architecture: Modular & Layered

The application has been refactored from a monolithic structure to a professional layered architecture in the `src/` directory.

- **Service Layer**: Decoupled business logic for Attendance, Members, Admins, and System concerns.
- **IPC Handlers**: Modular communication modules that bridge the frontend and backend without cluttering the main process.
- **Database Abstraction**: A custom JSON-based persistence layer with **Atomic-Write operations** and **In-Memory Caching** for high integrity and ultra-fast performance.
- **Zero Configuration**: A portable, serverless architecture that runs natively on Windows without requiring database installation.

## 💻 Tech Stack

- **Core**: Electron (Desktop Runtime)
- **Frontend**: Glassmorphism UI (HTML5, Vanilla CSS3, JavaScript ES6)
- **Data Layer**: Custom JSON-based Persistence (Node.js FileSystem API)
- **Security**: BcryptJS for secure admin credential hashing
- **Utilities**: jsQR (QR Code Processing), QRCode.js, SheetJS (Excel Integration)

## 🎨 Design Philosophy

The system features a **state-of-the-art dark theme** inspired by modern glassmorphism trends.
- **Vibrant Gold Accents**: High-contrast elements for accessibility and a premium feel.
- **Non-Blocking Feedback**: Real-time toast notifications for system alerts.
- **Dynamic Navigation**: Smooth transition between modules (Dashboard, Members, Reports, Settings).

## 🚀 Getting Started

1. **Clone the repository**:
   ```bash
   git clone https://github.com/QuenDev/qr-attendance-dtr-system.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the application**:
   ```bash
   npm start
   ```

## � Usage Guide

### For Administrators:
- **Login**: Use the default credentials (admin/admin123) on first run. Change the password immediately in Settings.
- **Add Members**: Navigate to the Members section, enter names, and generate QR codes.
- **Monitor Attendance**: View real-time dashboard with check-ins, trends, and reports.
- **Export Data**: Generate CSV/PDF reports from the Reports section.

### For Employees/Kiosk Mode:
- **Check-In/Out**: Scan QR code via the Employee Scanner window for instant attendance logging.
- **Session Handling**: Supports AM/PM sessions with automatic time-out calculations.

### System Requirements:
- **OS**: Windows 10/11
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 100MB free space
- **Camera**: Required for QR scanning (built-in or external webcam)

## 🔒 Security & Best Practices

- **Local-Only**: Designed for internal use; data stays on the device.
- **Encryption**: Admin passwords are hashed with bcrypt.
- **Backups**: Regularly export data to prevent loss.
- **Updates**: Pull latest changes from GitHub for bug fixes.

## 📧 Contact & Support

**Developer**: Quenedy Pabular  
**Email**: [quenedypabular12@gmail.com](mailto:quenedypabular12@gmail.com)

---
*Created with passion for efficient workforce management. Ideal for small organizations (up to 50 members) in kiosk or single-user setups.*
