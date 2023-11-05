#!/bin/bash

# Update package lists and upgrade packages
sudo apt update -y
sudo apt upgrade -y

# Install Node.js, npm, unzip, and openjdk-8-jre
sudo apt install nodejs -y
sudo apt install npm -y
sudo apt install unzip -y
sudo apt-get install openjdk-8-jre -y

# Install pm2 globally
npm install pm2 -g

# Download ANDRO.zip and unzip it
wget https://github.com/AryanVBW/ANDRO/releases/download/v.1.0/ANDRO.zip
unzip ANDRO.zip

# Navigate to the ANDRO directory and install its dependencies
cd ANDRO
npm install

# Start the application with pm2
pm2 start index.js

# Display a message indicating the script has finished
echo "ANDRO is now running with pm2."
