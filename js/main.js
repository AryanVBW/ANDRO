// Main JavaScript for ANDRO Website
// Matrix Animation
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Matrix rain effect
const characters = "ANDRO01";
const fontSize = 14;
const columns = canvas.width / fontSize;
const drops = [];

for (let i = 0; i < columns; i++) {
    drops[i] = 1;
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0F0';
    ctx.font = fontSize + 'px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

// Camtix Grid Animation
const gridContainer = document.getElementById('camtix-grid');
let perspective = 1000;
let rotationX = 20;
let isAnimating = true;

function createGrid() {
    const gridSize = 20;
    const cellSize = Math.max(window.innerWidth, window.innerHeight) / gridSize;
    
    gridContainer.innerHTML = '';
    gridContainer.style.transform = `rotateX(${rotationX}deg) translateZ(0)`;
    
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.cssText = `
                position: absolute;
                width: ${cellSize}px;
                height: ${cellSize}px;
                border: 1px solid rgba(0, 255, 0, 0.1);
                transform: translate(${j * cellSize}px, ${i * cellSize}px);
                transition: all 0.3s ease;
                background: rgba(0, 255, 0, 0.02);
            `;
            
            // Add hover effect
            cell.addEventListener('mouseover', () => {
                cell.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
                cell.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.3)';
            });
            
            cell.addEventListener('mouseout', () => {
                cell.style.backgroundColor = 'rgba(0, 255, 0, 0.02)';
                cell.style.boxShadow = 'none';
            });
            
            gridContainer.appendChild(cell);
        }
    }
}

// Animate grid
function animateGrid() {
    if (!isAnimating) return;
    
    rotationX = 20 + Math.sin(Date.now() / 2000) * 5;
    gridContainer.style.transform = `rotateX(${rotationX}deg) translateZ(0)`;
    requestAnimationFrame(animateGrid);
}

// Initialize animations
createGrid();
animateGrid();
setInterval(drawMatrix, 50);

// Handle window resize
window.addEventListener('resize', () => {
    resizeCanvas();
    createGrid();
});

// Mobile menu and dropdown handling
const hamburger = document.querySelector('.hamburger');
const nav = document.querySelector('nav');
const dropdowns = document.querySelectorAll('.dropdown');

// Toggle mobile menu
hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    nav.classList.toggle('active');
});

// Handle dropdowns on mobile
dropdowns.forEach(dropdown => {
    const link = dropdown.querySelector('.nav-link');
    
    // For mobile devices
    link?.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            dropdown.classList.toggle('active');
            
            // Close other dropdowns
            dropdowns.forEach(other => {
                if (other !== dropdown) {
                    other.classList.remove('active');
                }
            });
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
        nav.classList.remove('active');
        hamburger.classList.remove('active');
        dropdowns.forEach(dropdown => dropdown.classList.remove('active'));
    }
});

// Smooth scroll with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        if (this.classList.contains('nav-link') && window.innerWidth <= 768) {
            return; // Let the dropdown handler take care of it on mobile
        }
        
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Close mobile menu after clicking
            nav.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
});

// Terminal text effect
document.querySelectorAll('.terminal-text').forEach(element => {
    const text = element.textContent;
    element.textContent = '';
    let index = 0;
    
    function typeText() {
        if (index < text.length) {
            element.textContent += text.charAt(index);
            index++;
            setTimeout(typeText, 50);
        }
    }
    
    // Start typing when element is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                typeText();
                observer.unobserve(entry.target);
            }
        });
    });
    
    observer.observe(element);
});

// Reveal animations
function reveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    reveals.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (elementTop < windowHeight - 150) {
            element.classList.add('active');
        }
    });
}

// Add scroll event listener for reveal animations
window.addEventListener('scroll', reveal);
// Trigger once on load
reveal();

// Code Copy Functionality
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', () => {
        const codeBlock = button.nextElementSibling;
        const text = codeBlock.textContent;
        
        // Create a temporary textarea element to copy the text
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        
        try {
            document.execCommand('copy');
            button.classList.add('copied');
            button.innerHTML = '<i class="fas fa-check"></i>';
            
            // Reset button after 2 seconds
            setTimeout(() => {
                button.classList.remove('copied');
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
        }
        
        document.body.removeChild(textarea);
    });
});