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

## 🏗️ Architecture: Offline-First Reliability

Unlike traditional systems that rely on external SQL servers, this application implements a **custom flat-file JSON data persistence layer**. 

- **Reliable Offline Storage**: Engineered for environments where server connectivity is not guaranteed.
- **Atomic-Write Operations**: Ensures high data integrity and prevents file corruption during simultaneous read/write cycles.
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

## 📧 Contact & Support

**Developer**: Quenedy Pabular  
**Email**: [quenedypabular12@gmail.com](mailto:quenedypabular12@gmail.com)

---
*Created with passion for efficient workforce management.*
