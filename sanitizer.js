'use strict';
/*
 * Sanitzier used to keep Database clean and neat.
 * Each peer that that updated more then 24 Hrs will deleted from the network.
 * Each network that is empty for 24 Hrs will be deleted.
 *
 */

const app = require('./bin/config');
const initializeDatabases = require('./dbs');
const timePeerDeleted = 1000 * 60 * 60 * 6;    // 6 Hours for Peer to be deleted.
const intervalSanitizer = 1000 * 60 * 60 * 3;

const clearPeers = function(dbs, callback) {
    let limitTime = Date.now() - timePeerDeleted; // All peers that have created less then this date will be sanitized.
    dbs.pexDB.updateMany({},{ $pull: { peers: { $elemMatch: {time: {$lt: limitTime}}}}}, {multi: true}, function (err, result) {
        if (err) throw err;
        app.log(result);
        callback();
    });
};
const clearNetworks = function(dbs, callback) {
    let limitTime = Date.now() - timePeerDeleted; // All peers that have created less then this date will be sanitized.
    dbs.pexDB.deleteMany({peers: {$size : 0}}, function (err, result) {
        if (err) throw err;
        app.log(result);
        callback();
    });
};
const interSanitizer = function (dbs) {
    setInterval(() => {
        clearNetworks(dbs, function () {
            clearPeers(dbs, function() {
                app.log('Finish Sanitizing');
            });
        });
    }, intervalSanitizer);
};
// Initiate DataBase connection.  -->  /dbs/index.js
initializeDatabases().then(dbs => {
    ///=============================================================================================/
    ///                             Create Intervals                                                /
    ///=============================================================================================/
    // Initialize the application once database connections are ready.
    app.log('Start Sanitizer');
    // Search For empty networks:
    clearNetworks(dbs, function () {
        clearPeers(dbs, function() {
            app.log('Finish Sanitizing');
        });
    });

    // Search for outdated peers in each network:  db.pex.update({},{ $pull: { peers: { time: {$lt: 1529591882330}}}, }, {multi: true})
    interSanitizer(dbs);

    ///=============================================================================================/
// Catch for any errors of database connection
}).catch(err => {
    console.error('Failed to make database connection!');
    console.error(err);
    process.exit(1);
});