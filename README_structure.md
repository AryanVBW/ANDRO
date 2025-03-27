# ANDRO Project Structure Documentation

## Overview

ANDRO is a cloud-based remote Android management suite powered by Node.js. This document provides a detailed explanation of the project's structure, functionality, and processes.

## Table of Contents
- [Project Architecture](#project-architecture)
- [Directory Structure](#directory-structure)
- [Core Components](#core-components)
- [Installation Process](#installation-process)
- [APK Building Process](#apk-building-process)
- [Server-Client Communication](#server-client-communication)
- [Data Storage](#data-storage)
- [Features Implementation](#features-implementation)
- [Security Considerations](#security-considerations)
- [Flow Diagrams](#flow-diagrams)

## Project Architecture

ANDRO follows a client-server architecture:
- **Server**: A Node.js application that hosts the control panel and handles communication with Android clients
- **Client**: Android APK that connects to the server and provides access to device features
- **Web Interface**: Control panel for managing connected devices and performing actions

### System Flow

```
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│                   │         │                   │         │                   │
│  Web Interface    │<───────>│  ANDRO Server     │<───────>│  Android Client   │
│  (Control Panel)  │         │  (Node.js)        │         │  (APK)            │
│                   │         │                   │         │                   │
└───────────────────┘         └───────────────────┘         └───────────────────┘
```

## Directory Structure

```
ANDRO/
├── app/
│   └── factory/            # Android APK building components
│       ├── apktool.jar     # For APK decompilation/recompilation
│       ├── sign.jar        # For signing compiled APK
│       ├── base.apk        # Base Android client APK
│       └── decompiled/     # Decompiled APK files
├── assets/
│   ├── views/              # EJS templates for web interface
│   │   ├── partials/       # Reusable UI components
│   │   └── deviceManagerPages/ # Device management UI pages
│   └── webpublic/          # Public web assets (CSS, JS, images)
│       └── client_downloads/ # Downloaded files from clients
├── clientData/             # Client information storage
├── includes/              # Core server code
│   ├── apkBuilder.js      # APK patching and building functions
│   ├── clientManager.js   # Client connection management
│   ├── const.js           # System constants and configurations
│   ├── databaseGateway.js # Database operations
│   ├── expressRoutes.js   # Web server routes
│   └── logManager.js      # Log management
├── ANDRO1click/           # One-click installation scripts
│   ├── ANDRO1click.sh     # Main installation script
│   └── ANDRO1click_latest.sh
├── index.js               # Main application entry point
└── maindb.json            # Database storage
```

## Core Components

### 1. Server (Node.js)
The server component is built on Express.js and Socket.IO, handling:
- Web interface serving
- Client connections
- Command dispatching
- Data processing and storage

Key files:
- `index.js`: Main application entry point
- `includes/expressRoutes.js`: HTTP API routes
- `includes/clientManager.js`: Manages connected clients

### 2. Client (Android APK)
The Android client is a modified application that:
- Establishes WebSocket connection with the server
- Provides access to device features
- Executes commands received from server
- Sends device data to server

### 3. Web Interface
The control panel interface built with:
- EJS templates
- Semantic UI CSS framework
- Custom JavaScript for real-time interactions

## Installation Process

ANDRO offers two installation methods:

### 1-Click Installation
```bash
curl -sSL https://github.com/AryanVBW/ANDRO/releases/download/1click/ANDRO1click.sh | bash
```
OR
```bash
wget https://github.com/AryanVBW/ANDRO/releases/download/1click/ANDRO1click.sh 
chmod +x ANDRO1click.sh 
sudo ./ANDRO1click.sh 
```

The installation script:
1. Detects operating system
2. Installs dependencies (Node.js, npm, Java 1.8.0)
3. Downloads and extracts ANDRO
4. Installs Node.js dependencies
5. Starts the application with PM2

### Manual Installation
1. Install prerequisites:
   - Java Runtime Environment 8
   - Node.js 16+
   - PM2 (process manager)

2. Download and extract the release archive

3. Install dependencies:
   ```bash
   npm install
   pm2 start index.js
   pm2 startup
   pm2 save
   ```

4. Configure username/password in `maindb.json`

5. Access the control panel at `http://<SERVER_IP>:8080`

## APK Building Process

The APK building process involves:

1. **Verification**: Check that Java 1.8.0 is installed
2. **Patching**: Modify the APK to connect to your server
3. **Compilation**: Recompile the patched code
4. **Signing**: Sign the APK for installation

```
┌────────────────┐     ┌─────────────────┐     ┌────────────────┐     ┌─────────────────┐
│                │     │                 │     │                │     │                 │
│  Verify Java   │────>│  Patch APK URL  │────>│ Compile APK    │────>│   Sign APK      │
│                │     │                 │     │                │     │                 │
└────────────────┘     └─────────────────┘     └────────────────┘     └─────────────────┘
```

Implementation:
- `includes/apkBuilder.js`: Contains the functions for patching and building
- `includes/const.js`: Defines paths and commands

Key steps:
1. The `patchAPK()` function modifies the server URL in the decompiled APK
2. The `buildAPK()` function compiles and signs the modified APK

## Server-Client Communication

Communication uses Socket.IO for real-time bi-directional communication:

### Connection Process
1. Client APK connects to server with device information
2. Server assigns unique ID and stores client data
3. Web interface shows connected device

### Command Structure
Commands are identified by message keys defined in `const.js`:
- Camera: '0xCA'
- Files: '0xFI'
- Call: '0xCL'
- SMS: '0xSM'
- Microphone: '0xMI'
- Location: '0xLO'
- Contacts: '0xCO'
- WiFi: '0xWI'
- Notification: '0xNO'
- Clipboard: '0xCB'
- Installed Apps: '0xIN'
- Permissions: '0xPM'

## Data Storage

ANDRO uses LowDB, a lightweight JSON database:
- `maindb.json`: Stores admin credentials and system settings
- `clientData/`: Contains JSON files for each connected client

Client data structure includes:
- Device information
- Location history
- Logs
- Commands queue
- Files list

## Features Implementation

### Location Tracking
- Uses Android's location services
- Stores GPS coordinates in client data
- Displays on map using Leaflet.js

### Microphone Recording
- Captures audio via Android MediaRecorder
- Transfers recordings to server
- Stores in client's downloads folder

### File Management
- Browses device filesystem
- Downloads files to server
- Creates directory listings

### SMS & Call Logs
- Reads SMS database
- Retrieves call history
- Allows sending SMS messages

### Screen Capture
- Takes screenshots
- Records screen
- Transfers media to server

## Security Considerations

1. **Authentication**: Admin username/password required to access control panel
2. **HTTPS**: Recommended to use with NGINX reverse proxy for SSL/TLS
3. **Port Security**: Control port (default 8084) should be secured
4. **Disclaimer**: For educational purposes only

## Flow Diagrams

### Overall System Architecture

```
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│                   │         │                   │         │                   │
│  Web Browser      │<───────>│  ANDRO Server     │<───────>│  Android Client   │
│                   │         │  (Node.js)        │         │                   │
└───────────────────┘         └───────────────────┘         └───────────────────┘
        │                             │                             │
        │                             │                             │
        V                             V                             V
┌───────────────────┐         ┌───────────────────┐         ┌───────────────────┐
│                   │         │                   │         │                   │
│  Control Panel    │         │  Database         │         │  Device Features  │
│  UI               │         │  (LowDB JSON)     │         │                   │
│                   │         │                   │         │                   │
└───────────────────┘         └───────────────────┘         └───────────────────┘
```

### APK Building Process

```
┌───────────────────────────┐
│                           │
│  Web Interface            │
│  (Builder Page)           │
│                           │
└───────────┬───────────────┘
            │
            V
┌───────────────────────────┐
│                           │
│  Input Server URL & Port  │
│                           │
└───────────┬───────────────┘
            │
            V
┌───────────────────────────┐
│                           │
│  patchAPK() Function      │
│  - Modifies IOSocket.smali│
│                           │
└───────────┬───────────────┘
            │
            V
┌───────────────────────────┐
│                           │
│  buildAPK() Function      │
│  - Checks Java version    │
│  - Compiles with apktool  │
│  - Signs with sign.jar    │
│                           │
└───────────┬───────────────┘
            │
            V
┌───────────────────────────┐
│                           │
│  Download Ready APK       │
│                           │
└───────────────────────────┘
```

### Client Connection Flow

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│ Client Connects │────>│ Send Device Info│────>│ Server Assigns  │────>│ Client Added to │
│ via Socket.IO   │     │ to Server       │     │ Unique ID       │     │ Connected List  │
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
                                                                               │
                                                                               V
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │     │                 │
│ Device Appears  │<────│ Server Stores   │<────│ Location & Info │<────│ Client Sends    │
│ in Control Panel│     │ Client Data     │     │ Processing      │     │ Periodic Updates│
│                 │     │                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Conclusion

ANDRO is a powerful remote Android management system with an intuitive interface and extensive features. This document provides a comprehensive overview of its architecture, components, and processes to aid in understanding, modifying, or extending the system.
