const db = require('./databaseGateway');

module.exports = {
    log: (type, message) => {
        db.maindb.get('admin.logs').push({
            "time": new Date(),
            type: typeof type === 'string' ? type : type.name || 'INFO',
            message
        }).write();
        console.log(type.name || type, message);
    },
    getLogs: () => {
        return db.maindb.get('admin.logs').sortBy('time').reverse().value() || [];
    }
}