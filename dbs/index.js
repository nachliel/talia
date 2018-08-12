'use strict';
const MongoClient = require('mongodb').MongoClient;
const PROD_URI  = 'mongodb://localhost:27017/pex';
const app = require('../bin/config');
// For strategies on handling credentials, visit 12factor: https://12factor.net/config.
//const PROD_URI = "mongodb://<dbuser>:<dbpassword>@<host1>:<port1>,<host2>:<port2>/<dbname>?replicaSet=<replicaSetName>"

// Connect to Database
function connect(url) {
    app.debug('Connecting to DataBase: ' + PROD_URI)
    return MongoClient.connect(url).then(client => client.db())
}

// export Async function - > connecting arrange the array by dbs:
module.exports = async function() {
    let databases = await Promise.all([connect(PROD_URI)]);

    // Update in case of many dbs:
    return {
        pexDB: databases[0].collection('pex')
    }
};