// config.js - Organize and config all shared values of the app
'use strict';

const logger = require('./slogger')();
const PORT = 50001;                     // DNS 53
const constants = require('./constants');
const protocolRegex = /^([0-9a-z]{4,20})(\.([0-9a-z]{2,6}|\*\*))?(:([0-9a-z]{2,8}))?(\?([0-9a-z]{6,20}))?$/;
const packetMaxLength = 10000;
const packetTimes = 1;              // How many packets will be sent back
// Settings Logger settings:
logger.consoleEnabled(true);
logger.debugEnabled(true);
logger.segetLogFile('logfile.log');

///=============================================================================================/
// Shared Functions
// Return IP address without the dots:
const ipToString = function(ip, type) {
    let fractedIP = ip.split(/[,.]+/);
    if (type === constants.IPV6)
        return fractedIP[0] + fractedIP[1] + fractedIP[2] + fractedIP[3] + fractedIP[4] + fractedIP[5];
    else
        return fractedIP[0] + fractedIP[1] + fractedIP[2] + fractedIP[3];
};

// Set JSON to retrive to client:
const getDataToClient = function(doc) {
  if (doc === undefined)
      return undefined;
};

///=============================================================================================/
module.exports = {
    PORT: PORT,
    log: logger.log,
    debug: logger.debug,
    info: logger.info,
    error: logger.error,
    ip2Str: ipToString,
    constants: constants,
    MAXPKLENGTH : packetMaxLength,
    packetMultiplier : packetTimes
};