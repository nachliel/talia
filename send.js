const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.send('heyyyyyyyyy', 0, 'heyyyyyyyyy'.length, '50001', '35.180.100.123', function(err, bytes) {
    if (err)
        throw err;
    console.log('sended');
});