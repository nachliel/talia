'use strict';
const app = require('../bin/config');
const crypto = require('crypto');
const protocolRegex = /^([0-9a-z]{4,20})(\.([0-9a-z]{2,8}|\*\*))?(:([0-9a-z]{2,8}))?(\?([0-9a-z]{6,20}))?$/;

// Depeneds on DataBase connection
module.exports = function(dbs) {
    const filterPeers = function(peers, group) {
        // filter groups
        if (group !== undefined) {
            peers = peers.filter(e => e.group === group);
        }
        // Clean peers for unnesssery data
        for(let i=0; i<peers.length; i++) {
            delete peers[i].group;
            delete peers[i].time;
            if (peers[i].name === '') {
                delete peers[i].name;
            }
            // TODO: Filter the ip of client? think about it.
        }
        return peers;
    };
    // Handle income UDP:
    const getMessage = function(buffer, packetInfo, callback) {
        ///=============================================================================================/
        ///                             STAGE 1: Security and checks                                    /
        ///=============================================================================================/
        //  Converts buffer object to lowercase string and Deconstruct the message:
        //  NETWORK-NAME.GROUP:NAME?PASSWORD
        //let message = buffer.toString('utf8').toLowerCase();//split(/[,.]+/);
        let clientRespond = {
            code : 0,
            queryCode : app.constants.QUERY_REGULAR,
            timeOfRequest: Date.now(),
            queryHash: crypto.createHmac('sha256', buffer.toString('utf8')).digest('hex'),
            networkName: 'N/A',
            groupName: 'NONE',
            peers: []
        };
        // _______________________________________________________________________________________________

        // Validates buffer, split, convert to lowercase.
        let names = protocolRegex.exec(buffer.toString('utf8').toLowerCase());
        // names[0] -   full query 'network.group:name?password'
        // name[1]  -   Network Name
        // name[3]  -   Group Name
        // name[5]  -   Name of Peer
        // name[7]  -   Password
        // 1-7 are optional: they may be undefined.
        if (names === null) {   // Validation Failed REGEX
            app.debug('regex validation fail.');
            clientRespond.code = app.constants.RESPONSE_FORMAT_ERROR;
            callback(clientRespond);
            return app.constants.RESPONSE_FORMAT_ERROR;
        }

        // Passed REGEX Validation Success...
        ///=============================================================================================/
        ///                             STAGE 2: Create new doc                                         /
        ///=============================================================================================/
        // Hash NetworkName for search and insert in Database:
        // TODO: think if hash is needed... networkname is unique.
        const newDoc = {
            '_id': crypto.createHmac('sha256', names[1]).digest('hex'),   // _id of network name. HASHED
            'networkName': names[1],                                        // Network-Name: is the name of the network.
            'password' :  names[7] || '',
            'peers': [                                                      // Array Of peers
                {
                    'name': names[5] || '',                                 // Name of peer: Client, Server, Peer, etc...
                    'group': names[3] || '',                                // All peers without sub-name i.e group -> are related to network-name only.
                    'address': packetInfo.address,                          // Address  TODO: PORT REQUIRE?
                    'time': Date.now() / 1000 | 0,                          // Time of registration / updated peer. for delete offline peers. TODO: INQUIRE TIME. 3Hrs?
                }
            ]
        };
        clientRespond.networkName = names[1];
        clientRespond.groupName = names[3] || '';
        // Hash the password:
        if (newDoc.password !== '')
            newDoc.password = crypto.createHmac('sha256', names[7]).digest('hex');
        ///=============================================================================================/
        ///                             STAGE 3: Insert/Update Database                                 /
        ///=============================================================================================/
        // Find Doc in DB:
        dbs.pexDB.findOne({_id : newDoc._id}, function(err,doc) {
            if (err) {
                app.error('Error on findOne.');
                clientRespond.code = app.constants.RESPONSE_NAME_ERROR;
                callback(clientRespond);
                return clientRespond.code;
            }
            if (doc) {
                // Update:
                // Password set is Disabled:
                if (newDoc.password !== doc.password) {     // Request to change password while the doc is already registered. or Password is incorrect (if the doc has password)
                    clientRespond.code = app.constants.RESPONSE_NOT_AUTH;
                    callback(clientRespond);
                    return clientRespond.code;
                }

                if (newDoc.peers[0].group === '**') {       // Request from client to show all peers will terminate the update
                    clientRespond.peers = filterPeers(doc.peers);
                    clientRespond.code = app.constants.STATUS_REQUEST_FULFILLED;
                    clientRespond.queryCode = app.constants.QUERY_REQUEST;
                    callback(clientRespond);
                    return clientRespond.code;
                }
                else {                                      // Show only peers in client group
                    clientRespond.peers = filterPeers(doc.peers, newDoc.peers[0].group);//doc.peers.filter(e => e.group !== newDoc.peers.group);
                }
                dbs.pexDB.updateOne({'_id' : newDoc._id, 'peers.address' :  newDoc.peers[0].address}, { $set: { 'peers.$' : newDoc.peers[0]} }, { upsert : true}, function(err) {
                    // On failure Try push new peer to NetworkNameSpace: Failure mean no such address in peers
                    if (err) {
                        dbs.pexDB.updateOne({'_id' : newDoc._id}, { $push: { 'peers' : newDoc.peers[0]} }, function(err) {
                            if (err) {
                                app.error('DataBase failure');
                                clientRespond.code = app.constants.RESPONSE_DB_FAILURE;
                                callback(clientRespond);
                                return clientRespond.code;
                            }
                            app.debug(newDoc.networkName + '- Peer Inserted.');
                            clientRespond.code = app.constants.STATUS_NEW_PEER;
                            callback(clientRespond);
                            return clientRespond.code;
                        });
                    }
                    else {
                        app.debug(newDoc.networkName + '- Peer Updated.');
                        clientRespond.code = app.constants.STATUS_UPDATE;
                        callback(clientRespond);
                        return clientRespond.code;
                    }
                });
                ///=============================================================================================/
                ///                             STAGE 4: Respond to client                                      /
                ///=============================================================================================/
            }
            else {
                // Create new Doc on DB:
                dbs.pexDB.insertOne(newDoc, function(err, res) {
                    if (err) {
                        app.error('DataBase failure');
                        clientRespond.code = app.constants.RESPONSE_DB_FAILURE;
                        callback(clientRespond);
                        return clientRespond.code;
                    }
                    app.debug(newDoc.networkName + ': New Doc created.');
                    clientRespond.code = app.constants.STATUS_NEW_NAMESPACE;
                    callback(clientRespond);
                    return clientRespond.code;
                });
            }
        });
    };

    return {
        udpIn : getMessage
    };
};