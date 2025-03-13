# ANDRO - Advanced Android Remote Management Suite

<p align="center">
  <img src="assets/webpublic/logo.png" alt="ANDRO Logo" width="200">
</p>

<div align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#screenshots">Screenshots</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#security">Security</a> •
  <a href="#license">License</a>
</div>

<br>

ANDRO is a comprehensive Android device management platform built with Node.js, Express, and Socket.io. It provides a sleek, cyberpunk-inspired web interface for remote monitoring and management of Android devices.

## 💡 Features

- **Real-time Device Monitoring**
  - Live GPS tracking and location history
  - System information and device details
  - Battery status and hardware info
  
- **Communication Management**
  - View and manage SMS messages
  - Access call logs and contacts
  - Monitor notifications
  
- **File Management**
  - Browse and download device files
  - Manage downloads
  - View installed applications
  
- **Remote Access**
  - Clipboard monitoring
  - Microphone recording
  - Permission management
  
- **Sleek UI**
  - Responsive design
  - Dark/Light theme toggle
  - Cyberpunk-inspired interface
  - Matrix background animation

## 🔧 Installation

### Prerequisites

- Node.js (v14 or newer)
- npm (v6 or newer)
- Java JDK (for APK building)

### Server Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/AryanVBW/ANDRO.git
   cd ANDRO
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure the server:
   Edit `includes/const.js` to set your preferred ports and configuration.

4. Start the server:
   ```bash
   # Production
   npm start
   
   # Development mode with debug info
   DEBUG=andro:* npm run dev
   ```

5. Access the web interface:
   Open your browser and navigate to `http://localhost:8080`
   Default credentials: 
   - Username: `admin`
   - Password: `admin`

### Client Setup

1. Access the Builder page in the web interface
2. Enter your server's public IP/domain and port
3. Build and download the APK
4. Install the APK on target Android devices

## 📱 Usage

### Logging In
Navigate to the web panel URL and log in using your credentials. The default login is:
- Username: `admin`
- Password: `admin`

It's highly recommended to change these credentials after your first login.

### Dashboard
The main dashboard shows all connected devices, separated into online and offline categories. Click "Manage" to access a specific device's controls.

### Device Management
The device management interface provides access to various modules:

- **Info**: View device specs, Android version, and system details
- **GPS**: Monitor device location and location history
- **Microphone**: Record audio from the device
- **Contacts**: Access the device's contact list
- **Calls**: Review call history
- **Clipboard**: Monitor text copied to clipboard
- **Notifications**: View app notifications
- **SMS**: Access text messages
- **WiFi**: View WiFi connection details and history
- **Applications**: List installed apps
- **Permissions**: View and manage app permissions
- **Files**: Browse and download device files
- **Downloads**: Access downloads folder

### APK Builder
Use the builder page to create custom APKs with your server information. The generated APK can be shared with target devices to establish connection.

## 🖼️ Screenshots

<p align="center">
  <img src="https://raw.githubusercontent.com/AryanVBW/ANDRO/main/screenshots/dashboard.png" alt="Dashboard" width="45%">
  <img src="https://raw.githubusercontent.com/AryanVBW/ANDRO/main/screenshots/device-info.png" alt="Device Info" width="45%">
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/AryanVBW/ANDRO/main/screenshots/file-manager.png" alt="File Manager" width="45%">
  <img src="https://raw.githubusercontent.com/AryanVBW/ANDRO/main/screenshots/gps-tracking.png" alt="GPS Tracking" width="45%">
</p>

## 🤝 Contributing

Contributions are welcome! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute to this project. Key points:

- Contributions to the UI should target the `WebPanel` branch
- Website improvements should target the `website` branch
- Follow the code style guidelines
- Test thoroughly before submitting pull requests

## 🔒 Security

This application should be used responsibly and ethically. Always ensure you have proper authorization before monitoring any device. Unauthorized surveillance may violate local laws.

### Security Recommendations

1. Change default login credentials immediately
2. Use HTTPS for production deployments
3. Keep your Node.js and dependencies updated
4. Restrict access to the web panel through firewall rules
5. Regularly review connected devices

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Express.js](https://expressjs.com/) - The web framework
- [Socket.io](https://socket.io/) - Real-time communication
- [Semantic UI](https://semantic-ui.com/) - UI components
- [Leaflet](https://leafletjs.com/) - Interactive maps

---

<p align="center">
  Made with <span style="color: #ff0066;">❤️‍🔥</span> by <a href="https://github.com/AryanVBW" target="_blank">AryanVBW</a>
</p>
