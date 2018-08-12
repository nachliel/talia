'use strict';
const dgram = require('dgram');
const server = dgram.createSocket('udp4');
const app = require('./bin/config');
const initializeDatabases = require('./dbs');
const routes = require('./routes');
const pack = require('./routes/packet')(server);

// Initiate DataBase connection.  -->  /dbs/index.js
initializeDatabases().then(dbs => {
    ///=============================================================================================/
    ///                             Create events for server                                        /
    ///=============================================================================================/
    // Initialize the application once database connections are ready.
    server.on('error', (err) => {
        app.log(`server error:\n${err.stack}`);
        server.close();
    });
    // Event on new message. *datagram packet
    server.on('message', (msg, rinfo) => {
        app.log(`UDP income: ${msg} from ${rinfo.address}:${rinfo.port}`);
        // Logic for new udp from client
        routes(dbs).udpIn(msg, rinfo, function(res) {
            // Callback: Send response to client:
            app.debug('Send udp to client...');
            pack.sendUDP(res,rinfo);
        });
    });
    // Event: start listen for incoming dgrams.
    server.on('listening', () => {
        const address = server.address();
        app.log(`server listening on: ${address.address}:${address.port}`);
    });
    // See TODO: incquire port.41234
    server.bind(app.PORT);
    ///=============================================================================================/
// Catch for any errors of database connection
}).catch(err => {
    console.error('Failed to make database connection!');
    console.error(err);
    process.exit(1);
});