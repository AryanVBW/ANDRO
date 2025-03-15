#!/bin/bash

# Define colors for hacker-themed output
GREEN='\033[0;32m'
BRIGHT_GREEN='\033[1;32m'
NC='\033[0m' # No Color (reset)

# Display banner
echo -e "${BRIGHT_GREEN}"
echo "  █████╗ ███╗   ██╗██████╗ ██████╗  ██████╗ "
echo " ██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔═══██╗"
echo " ███████║██╔██╗ ██║██║  ██║██████╔╝██║   ██║"
echo " ██╔══██║██║╚██╗██║██║  ██║██╔══██╗██║   ██║"
echo " ██║  ██║██║ ╚████║██████╔╝██║  ██║╚██████╔╝"
echo " ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝ "
echo -e "${NC}"

# Function to log actions
log() {
    echo -e "${GREEN}[*]${NC} $1"
}

# Function to log errors
error() {
    echo -e "\033[0;31m[!] ERROR: $1${NC}" >&2
}

# Function to check if a command exists
check_command() {
    command -v "$1" &> /dev/null
}

# Function to execute commands with error handling
execute() {
    log "Executing: $1"
    eval $1
    if [ $? -ne 0 ]; then
        error "$2"
        return 1
    fi
    return 0
}

# Detect operating system
log "Detecting operating system..."
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows"
else
    OS="Unknown"
fi
log "Detected OS: $OS"

# Install dependencies based on OS
if [ "$OS" == "Linux" ]; then
    log "Updating package lists..."
    execute "sudo apt update -y" "Failed to update package lists"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "sudo apt install nodejs -y" "Failed to install Node.js"
    fi
    
    # Check and install npm
    if check_command npm; then
        log "npm is already installed. Version: $(npm --version)"
    else
        log "Installing npm..."
        execute "sudo apt install npm -y" "Failed to install npm"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "sudo apt install unzip -y" "Failed to install unzip"
    fi
    
    # Check and install OpenJDK 8 JRE
    if java -version 2>&1 | grep -q "version \"1.8"; then
        log "OpenJDK 8 is already installed."
    else
        log "Installing OpenJDK 8 JRE..."
        execute "sudo apt-get install openjdk-8-jre -y" "Failed to install OpenJDK 8"
    fi
    
elif [ "$OS" == "macOS" ]; then
    # Check if Homebrew is installed
    if ! check_command brew; then
        log "Installing Homebrew..."
        execute '/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"' "Failed to install Homebrew"
    else
        log "Homebrew is already installed."
    fi
    
    log "Updating Homebrew..."
    execute "brew update" "Failed to update Homebrew"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "brew install node" "Failed to install Node.js"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "brew install unzip" "Failed to install unzip"
    fi
    
    # Check and install OpenJDK 8
    if /usr/libexec/java_home -v 1.8 &> /dev/null; then
        log "OpenJDK 8 is already installed."
    else
        log "Installing OpenJDK 8..."
        execute "brew install --cask adoptopenjdk/openjdk/adoptopenjdk8" "Failed to install OpenJDK 8"
    fi
    
elif [ "$OS" == "Windows" ]; then
    log "Windows OS detected. Checking dependencies..."
    
    # Check if Node.js is installed
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Node.js is not installed."
        if check_command choco; then
            log "Installing Node.js via Chocolatey..."
            execute "choco install nodejs -y" "Failed to install Node.js"
        else
            log "Chocolatey not found. Please install Node.js manually: https://nodejs.org/"
        fi
    fi
    
    # Check if unzip is installed
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "unzip is not installed."
        if check_command choco; then
            log "Installing unzip via Chocolatey..."
            execute "choco install unzip -y" "Failed to install unzip"
        else
            log "Please install unzip manually."
        fi
    fi
    
    # Check if Java is installed
    if check_command java; then
        log "Java is already installed. Version: $(java -version 2>&1 | head -n 1)"
    else
        log "Java is not installed."
        if check_command choco; then
            log "Installing AdoptOpenJDK8 via Chocolatey..."
            execute "choco install adoptopenjdk8 -y" "Failed to install AdoptOpenJDK8"
        else
            log "Please install Java JRE 8 manually: https://www.java.com/download/"
        fi
    fi
else
    error "Unsupported operating system: $OS"
    exit 1
fi

# Check and install pm2 globally
if check_command pm2; then
    log "pm2 is already installed. Version: $(pm2 --version)"
else
    log "Installing pm2 globally..."
    execute "npm install pm2 -g" "Failed to install pm2 globally"
fi

# Check if ANDRO.zip exists
if [ -f "ANDRO.zip" ]; then
    log "ANDRO.zip already exists. Using existing file."
else
    log "Downloading ANDRO.zip..."
    execute "wget https://github.com/AryanVBW/ANDRO/releases/download/v.2.0/ANDRO.zip" "Failed to download ANDRO.zip"
fi

# Check if ANDRO directory exists
if [ -d "ANDRO" ]; then
    log "ANDRO directory already exists."
else
    log "Extracting ANDRO.zip..."
    execute "unzip ANDRO.zip" "Failed to extract ANDRO.zip"
fi

# Navigate to ANDRO directory and install dependencies
log "Navigating to ANDRO directory..."
cd ANDRO || { error "Failed to navigate to ANDRO directory"; exit 1; }

log "Installing ANDRO dependencies..."
execute "npm install" "Failed to install ANDRO dependencies"

# Start the application with pm2
log "Starting ANDRO application with pm2..."
execute "pm2 start index.js" "Failed to start ANDRO with pm2"

log "ANDRO is now running with pm2."
log "To view the application status, run: pm2 status"
log "To view logs, run: pm2 logs"
log "To stop the application, run: pm2 stop index.js"

echo -e "${BRIGHT_GREEN}Installation complete! ANDRO is now running.${NC}"
echo -e "${BRIGHT_GREEN}Access the service at:${NC}"
echo -e "${BRIGHT_GREEN}Localhost URL: http://localhost:8080${NC}"
echo -e "${BRIGHT_GREEN}System IP URL: http://$(hostname -I | awk '{print $1}'):8080${NC}"
echo -e "${BRIGHT_GREEN}Login credentials - Username: andro, Password: admin${NC}"
