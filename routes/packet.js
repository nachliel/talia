'use strict';
const app = require('../bin/config');
const crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'po09sd54';

///=============================================================================================/
///                             Packet Handler - Send and receive UDP                           /
///=============================================================================================/

module.exports = function(server) {
    let stack = [];
    //todo: LIFO STRUCTURE FOR INCOMMING PACKETS.
    let clients = [];
    /**
     * Text Encrypter, return crypted text.
     * @param text
     * @returns {*}
     */
    const encrypter  = function encrypt(text){
        const cipher = crypto.createCipher(algorithm,password);
        const crypted = cipher.update(text,'utf8','hex');
        crypted += cipher.final('hex');
        return crypted;
    };
    /**
     * Text decrypter, return original text.
     * @param text
     * @returns {*}
     */
    const decrypter = function decrypt(text){
        const decipher = crypto.createDecipher(algorithm,password);
        let dec = decipher.update(text,'hex','utf8');
        dec += decipher.final('utf8');
        return dec;
    };
    /**
     * Conver String IP address to integer      xxx.xxx.xxx.xxx -> INTEGER
     * @param ip
     * @returns {number}
     */
    const ipStr2Int = function ip2Integer(ip) {
        if (typeof ip !== 'string')
            throw 'Err: ip is not a string.';
        let octets = ip.split(/[.]+/);
        let num = 0;
        for (let i=3; i >= 0; i--) {
            num += ((octets[3-i])%256 * Math.pow(256,i));
        }
        return num;
    };
    /**
     * Convert the ip to string.                INTEGER -> xxx.xxx.xxx.xxx
     * @param ip - number type ip
     * @returns {string} - ip address, string format
     */
    const ipInt2Str = function int2IP(ip) {
        if (typeof ip !== 'number')
            throw 'Err: ip is not a string.';
        return ((ip >> 24 ) & 0xFF) + "." + ((ip >> 16 ) & 0xFF) + "." + ((ip >>  8 ) & 0xFF) + "." + ( ip & 0xFF);
    };

    /**
     * Convert All IP's in networkPeers array to Integer IP.
     * @param ips - Optional (Array of INT IP's) - return new converted ip's array.
     * @returns {Array} - Optional
     */
    const peerIpsInt2Str = function (ips) {
        if (typeof  ips === 'undefined' && typeof this.networkPeers!=='undefined') {
            for (let i in this.networkPeers) {
                this.networkPeers[i].ip = ipInt2Str(this.networkPeers[i].ip);
            }
        }
        else
        {
            let newIps = [];
            for (let i in ips) {
                newIps[i] = ipInt2Str(ips[i]);
            }
            return newIps;
        }
    };

    /**
     * Convert All IP's in networkPeers array to String IP.
     * @param ips - Optional (Array of String IP's) - return new converted ip's array.
     * @returns {Array} - if parameter is defined,
     */
    const peerIpsStr2Int = function (ips) {
        if (typeof  ips === 'undefined') {
            for (let i in this.networkPeers) {
                this.networkPeers[i].ip = ipStr2Int(this.networkPeers[i].ip);
            }
        }
        else
        {
            let newIps = [];
            for (let i in ips) {
                newIps[i] = ipStr2Int(ips[i]);
            }
            return newIps;
        }

    };
    const sendPacket = function(buffer, rinfo, times) {
        for(let i = 0 ; i < times; i++) {
            server.send(buffer, 0, buffer.length, rinfo.port, rinfo.address, function(err, bytes) {
                if (err)
                    throw err;
                app.debug('Respond ' + i + 1 + '/' + times + ': ' +  bytes + ' bytes to client: '  + rinfo.address);
            });
        }
    };

    return {
        packetEncrypt: function(buffer) {
            return encrypter(buffer);
        },
        packetDecrypter: function(buffer) {
            return decrypter(buffer);
        },
        newClient : function(message, rinfo) {
            let clientHash = crypto.createHmac('sha256', message.toString('utf8') + rinfo.address.toString('utf8')).digest('hex');
            if (clients[ip2Int(rinfo.address)] === 'undefined') {
                clients[ip2Int(rinfo.address)] = 1;
            }
            else {
                clients[ip2Int(rinfo.address)] += 1;
            }
        },
        sendUDP : function(res, rinfo) {
            let buffer = JSON.stringify(res);
            const bufferLength = buffer.length;
            if (bufferLength < app.MAXPKLENGTH) {
                //let buffer = 'return string';
                sendPacket(buffer, rinfo, app.packetMultiplier);
            }
            else {
                // Send multiple packets :
                // Buffer will added notice of multiple packets.
                // #/# - Number of packet / number of sum of packets send.
                // each buffer will contain: #/# + Buffer
                let sumOfPackets = Math.ceil(bufferLength / app.MAXPKLENGTH);
                let i = 0;
                let packetNumber = 1;
                while (i < bufferLength) {
                    let streamBuffer = packetNumber + '/' + sumOfPackets +  buffer.slice(i,app.MAXPKLENGTH + i);
                    sendPacket(streamBuffer, rinfo, app.packetMultiplier);
                    i += app.MAXPKLENGTH;
                }
            }
        }
    }
};