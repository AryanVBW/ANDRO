#!/bin/bash

# Define colors for hacker-themed output
GREEN='\033[0;32m'
BRIGHT_GREEN='\033[1;32m'
CYAN='\033[0;36m'
BRIGHT_CYAN='\033[1;36m'
BLUE='\033[0;34m'
BRIGHT_BLUE='\033[1;34m'
RED='\033[0;31m'
BRIGHT_RED='\033[1;31m'
YELLOW='\033[0;33m'
BRIGHT_YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
BRIGHT_PURPLE='\033[1;35m'
NC='\033[0m' # No Color (reset)

# Get terminal size
TERM_WIDTH=$(tput cols 2>/dev/null || echo 80)
TERM_HEIGHT=$(tput lines 2>/dev/null || echo 24)

# Function to create a centered line with padding
center_line() {
    local text="$1"
    local color_start="$2"
    local color_end="$3"
    local text_length=${#text}
    local padding_total=$((TERM_WIDTH - 4 - text_length))
    local padding_left=$((padding_total / 2))
    local padding_right=$((padding_total - padding_left))
    local padding_left_str="$(printf '%*s' $padding_left '')"
    local padding_right_str="$(printf '%*s' $padding_right '')"
    
    echo -e "${BRIGHT_RED}║${color_start}${padding_left_str}${text}${padding_right_str}${color_end}${BRIGHT_RED}║${NC}"
}

# Create border line of appropriate width
create_border_line() {
    local char="$1"
    local border_width=$((TERM_WIDTH - 2))
    printf "${BRIGHT_RED}%s%s%s${NC}\n" "$char" "$(printf '%*s' $border_width | tr ' ' '═')" "$char"
}

# Display enhanced banner with auto-sizing
clear
echo ""

# Top border
create_border_line "╔" "╗"

# Empty line
center_line "" "" ""

# Logo lines - will center in terminal
if [ $TERM_WIDTH -ge 70 ]; then
    # Full logo for larger terminals
    center_line "  █████╗ ███╗   ██╗██████╗ ██████╗  ██████╗     " "${BRIGHT_GREEN}" "${NC}"
    center_line " ██╔══██╗████╗  ██║██╔══██╗██╔══██╗██╔═══██╗    " "${BRIGHT_GREEN}" "${NC}"
    center_line " ███████║██╔██╗ ██║██║  ██║██████╔╝██║   ██║    " "${BRIGHT_GREEN}" "${NC}"
    center_line " ██╔══██║██║╚██╗██║██║  ██║██╔══██╗██║   ██║    " "${BRIGHT_GREEN}" "${NC}"
    center_line " ██║  ██║██║ ╚████║██████╔╝██║  ██║╚██████╔╝    " "${BRIGHT_GREEN}" "${NC}"
    center_line " ╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝ ╚═════╝     " "${BRIGHT_GREEN}" "${NC}"
else
    # Simplified logo for smaller terminals
    center_line "╔══ ANDRO ══╗" "${BRIGHT_GREEN}" "${NC}"
    center_line "║ Android Data ║" "${BRIGHT_GREEN}" "${NC}"
    center_line "╚═══════════╝" "${BRIGHT_GREEN}" "${NC}"
fi

# Empty line
center_line "" "" ""

# Description - adapts to different terminal widths
if [ $TERM_WIDTH -ge 70 ]; then
    center_line "𝒜𝓃𝒹𝓇𝓸𝒾𝒹 𝒟𝒶𝓉𝒶 𝒜𝓊𝓉𝑜𝓂𝒶𝓉𝒾𝑜𝓃 & 𝑅𝑒𝓂𝑜𝓉𝑒 𝒪𝓅𝑒𝓇𝒶𝓉𝒾𝑜𝓃𝓈" "${BRIGHT_CYAN}" "${NC}"
else
    center_line "Android Data Automation" "${BRIGHT_CYAN}" "${NC}"
    center_line "& Remote Operations" "${BRIGHT_CYAN}" "${NC}"
fi

# Empty line
center_line "" "" ""

# Copyright notice
center_line "Created by Vivek W © $(date +%Y)" "${BRIGHT_YELLOW}" "${NC}"

# Bottom border
create_border_line "╚" "╝"

echo ""
sleep 1

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
if [[ -f /data/data/com.termux/files/usr/bin/termux-info ]]; then
    OS="Termux"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Further detect specific Linux distribution
    if [ -f /etc/arch-release ]; then
        OS="Arch"
    elif [ -f /etc/fedora-release ]; then
        OS="Fedora"
    elif [ -f /etc/gentoo-release ]; then
        OS="Gentoo"
    elif [ -f /etc/garuda-release ]; then
        OS="Garuda"
    elif [ -f /etc/redhat-release ]; then
        OS="RHEL/CentOS"
    elif [ -f /etc/debian_version ]; then
        OS="Debian/Ubuntu"
    else
        OS="Linux"
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macOS"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="Windows"
else
    OS="Unknown"
fi
log "Detected OS: $OS"

# Install dependencies based on OS
if [ "$OS" == "Termux" ]; then
    log "Termux detected. Updating package lists..."
    execute "pkg update -y" "Failed to update package lists"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "pkg install nodejs -y" "Failed to install Node.js"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "pkg install unzip -y" "Failed to install unzip"
    fi
    
    # Check and install wget
    if check_command wget; then
        log "wget is already installed."
    else
        log "Installing wget..."
        execute "pkg install wget -y" "Failed to install wget"
    fi
    
    # Check and install OpenJDK
    if check_command java; then
        log "Java is already installed. Version: $(java -version 2>&1 | head -n 1)"
    else
        log "Installing OpenJDK..."
        execute "pkg install openjdk-17 -y" "Failed to install OpenJDK"
    fi

elif [ "$OS" == "Arch" ] || [ "$OS" == "Garuda" ]; then
    log "Arch-based Linux detected. Updating package lists..."
    execute "sudo pacman -Syu --noconfirm" "Failed to update package lists"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "sudo pacman -S nodejs npm --noconfirm" "Failed to install Node.js"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "sudo pacman -S unzip --noconfirm" "Failed to install unzip"
    fi
    
    # Check and install OpenJDK 8 JRE
    if java -version 2>&1 | grep -q "version \"1.8"; then
        log "OpenJDK 8 is already installed."
    else
        log "Installing OpenJDK 8 JRE..."
        execute "sudo pacman -S jre8-openjdk --noconfirm" "Failed to install OpenJDK 8"
    fi
    
elif [ "$OS" == "Fedora" ]; then
    log "Fedora detected. Updating package lists..."
    execute "sudo dnf update -y" "Failed to update package lists"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "sudo dnf install nodejs -y" "Failed to install Node.js"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "sudo dnf install unzip -y" "Failed to install unzip"
    fi
    
    # Check and install OpenJDK 8 JRE
    if java -version 2>&1 | grep -q "version \"1.8"; then
        log "OpenJDK 8 is already installed."
    else
        log "Installing OpenJDK 8 JRE..."
        execute "sudo dnf install java-1.8.0-openjdk -y" "Failed to install OpenJDK 8"
    fi

elif [ "$OS" == "RHEL/CentOS" ]; then
    log "RHEL/CentOS detected. Updating package lists..."
    execute "sudo yum update -y" "Failed to update package lists"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "sudo yum install nodejs -y" "Failed to install Node.js"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "sudo yum install unzip -y" "Failed to install unzip"
    fi
    
    # Check and install OpenJDK 8 JRE
    if java -version 2>&1 | grep -q "version \"1.8"; then
        log "OpenJDK 8 is already installed."
    else
        log "Installing OpenJDK 8 JRE..."
        execute "sudo yum install java-1.8.0-openjdk -y" "Failed to install OpenJDK 8"
    fi

elif [ "$OS" == "Gentoo" ]; then
    log "Gentoo detected. Updating package lists..."
    execute "sudo emerge --sync" "Failed to update package lists"
    
    # Check and install Node.js
    if check_command node; then
        log "Node.js is already installed. Version: $(node --version)"
    else
        log "Installing Node.js..."
        execute "sudo emerge -av net-libs/nodejs" "Failed to install Node.js"
    fi
    
    # Check and install unzip
    if check_command unzip; then
        log "unzip is already installed."
    else
        log "Installing unzip..."
        execute "sudo emerge -av app-arch/unzip" "Failed to install unzip"
    fi
    
    # Check and install OpenJDK 8 JRE
    if java -version 2>&1 | grep -q "version \"1.8"; then
        log "OpenJDK 8 is already installed."
    else
        log "Installing OpenJDK 8 JRE..."
        execute "sudo emerge -av dev-java/openjdk-bin:8" "Failed to install OpenJDK 8"
    fi

elif [ "$OS" == "Debian/Ubuntu" ] || [ "$OS" == "Linux" ]; then
    log "Debian/Ubuntu or general Linux detected. Updating package lists..."
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
    if [ "$OS" == "Termux" ]; then
        execute "wget https://github.com/AryanVBW/ANDRO/releases/download/v.2.0/ANDRO.zip -O ANDRO.zip" "Failed to download ANDRO.zip"
    else
        execute "wget https://github.com/AryanVBW/ANDRO/releases/download/v.2.0/ANDRO.zip" "Failed to download ANDRO.zip"
    fi
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

# Define colors for hacker-themed output
GREEN='\033[0;32m'
BRIGHT_GREEN='\033[1;32m'
BRIGHT_PURPLE='\033[1;35m'
NC='\033[0m' # No Color (reset)

# Highlight specific parts of the output with different colors
URL_COLOR='\033[1;34m' # Bright Blue for URLs
CREDENTIAL_COLOR='\033[1;33m' # Bright Yellow for credentials

echo -e "${BRIGHT_GREEN}Installation complete! ANDRO is now running.${NC}"
echo -e "${BRIGHT_PURPLE}Access the service at:${NC}"

# Get IP address based on OS
if [ "$OS" == "Termux" ]; then
    IP_ADDRESS=$(ifconfig 2>/dev/null | grep -E "inet (addr:)?192\.168\.[0-9]+\.[0-9]+" | awk '{print $2}' | sed 's/addr://')
    if [ -z "$IP_ADDRESS" ]; then
        IP_ADDRESS=$(ip addr show 2>/dev/null | grep -E "inet 192\.168\.[0-9]+\.[0-9]+" | awk '{print $2}' | cut -d/ -f1)
    fi
elif [[ "$OS" == "Linux" ]] || [[ "$OS" == "Debian/Ubuntu" ]] || [[ "$OS" == "Arch" ]] || [[ "$OS" == "Garuda" ]] || [[ "$OS" == "Fedora" ]] || [[ "$OS" == "RHEL/CentOS" ]] || [[ "$OS" == "Gentoo" ]]; then
    IP_ADDRESS=$(hostname -I 2>/dev/null | awk '{print $1}')
    if [ -z "$IP_ADDRESS" ]; then
        IP_ADDRESS=$(ip addr show 2>/dev/null | grep -E "inet 192\.168\.[0-9]+\.[0-9]+" | awk '{print $2}' | cut -d/ -f1 | head -n 1)
    fi
elif [ "$OS" == "macOS" ]; then
    IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -n 1)
elif [ "$OS" == "Windows" ]; then
    IP_ADDRESS=$(ipconfig | findstr /i "IPv4" | awk '{print $NF}' | head -n 1)
else
    IP_ADDRESS="Unknown"
fi

echo -e "${BRIGHT_PURPLE}Localhost URL: ${URL_COLOR}http://localhost:8080${NC}"
echo -e "${BRIGHT_PURPLE}System IP URL: ${URL_COLOR}http://${IP_ADDRESS}:8080${NC}"
echo -e "${BRIGHT_PURPLE}Login credentials - Username: ${CREDENTIAL_COLOR}andro${NC}, Password: ${CREDENTIAL_COLOR}admin${NC}"
