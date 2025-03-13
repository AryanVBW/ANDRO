function sendCommand(commandID, params = {}, cb = () => { }) {
    let queryString = $.param(params);
    let url = baseURL + '/' + commandID + '?' + queryString;
    $.post(url, function (data) {
        console.log(data);
        if (data.error) return cb(data.error, undefined)
        else return cb(false, data.message);
    });
}

function showNotification(backgroundColor, text) {
    Snackbar.show({ text, backgroundColor, pos: 'top-right', showAction: false });
}

function updateButton(element, commandID, additionalParams = {}) {
    $(element).addClass('loading');
    sendCommand(commandID, additionalParams, (error, message) => {
        // ok, yes, i'm adding 'fake' delay, it just makes the front end nicer, okay!?
        if (error) {
            setTimeout(() => {
                showNotification('#f03434', error)
                $(element).removeClass('loading')
            }, 300)
        } else {
            setTimeout(() => {
                showNotification('#2ecc71', message);
                $(element).removeClass('loading');
                if (message === 'Requested') setTimeout(() => { window.location = window.location }, 200)
            }, 300)
        }
    });
}

// Dark Mode Toggle Functionality
function setTheme(themeName) {
    localStorage.setItem('theme', themeName);
    document.documentElement.setAttribute('data-theme', themeName);
    
    // Update the toggle button icon
    if (themeName === 'dark') {
        $('.theme-toggle i').removeClass('moon').addClass('sun');
    } else {
        $('.theme-toggle i').removeClass('sun').addClass('moon');
    }
}

// Check for saved theme preference or set default
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Initialize theme toggle button if it exists
    if ($('.theme-toggle').length === 0) {
        const icon = savedTheme === 'dark' ? 'sun' : 'moon';
        $('body').append(`<div class="theme-toggle"><i class="icon ${icon}"></i></div>`);
        
        // Add click event listener
        $('.theme-toggle').on('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const switchToTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(switchToTheme);
            
            // Show notification
            const message = switchToTheme === 'dark' ? 'Dark mode activated' : 'Light mode activated';
            const color = switchToTheme === 'dark' ? '#00ff9d' : '#2ecc71';
            showNotification(color, message);
        });
    }
}

// Initialize matrix background effect
function initMatrix() {
    if ($('.matrix-bg').length === 0 && document.documentElement.getAttribute('data-theme') === 'dark') {
        const canvas = document.createElement('canvas');
        canvas.classList.add('matrix-bg');
        document.body.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const matrix = "ABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%";
        const matrixChars = matrix.split('');
        
        const fontSize = 14;
        const columns = canvas.width / fontSize;
        const drops = [];
        
        for (let i = 0; i < columns; i++) {
            drops[i] = 1;
        }
        
        function drawMatrix() {
            if (document.documentElement.getAttribute('data-theme') !== 'dark') {
                cancelAnimationFrame(matrixAnimation);
                $('.matrix-bg').remove();
                return;
            }
            
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "#00ff9d";
            ctx.font = fontSize + "px monospace";
            
            for (let i = 0; i < drops.length; i++) {
                const text = matrixChars[Math.floor(Math.random() * matrixChars.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                
                drops[i]++;
            }
            
            matrixAnimation = requestAnimationFrame(drawMatrix);
        }
        
        let matrixAnimation = requestAnimationFrame(drawMatrix);
        
        window.addEventListener('resize', function() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
}

// Initialize theme and matrix effect when DOM is ready
$(document).ready(function() {
    initTheme();
    
    // Add event listener for theme changes to toggle matrix effect
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.attributeName === 'data-theme') {
                if (document.documentElement.getAttribute('data-theme') === 'dark') {
                    initMatrix();
                }
            }
        });
    });
    
    observer.observe(document.documentElement, { attributes: true });
});