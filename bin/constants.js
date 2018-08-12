'use strict';
/*
    constants.js
    Maintain the constants of the software
 */
module.exports = {
    TRIP_STATUS_INITIATED   : 1000,
    ERROR_CODE_1            : 1,
                                    // Response codes for client
    STATUS_NEW_NAMESPACE    : 600,  // Create new Network Name
    STATUS_NEW_PEER         : 601,  // Create New Peer
    STATUS_UPDATE           : 602,  // Update Peer
    STATUS_NEW_ERROR_0      : 630,  // Unknown Error 0
    STATUS_NEW_ERROR_1      : 631,  // Unknown Error 1
    STATUS_REQUEST_FULFILLED: 632,  // Unknown Error 1
    IPV4                    : 32,   // IPV4 FLAG Also # of bytes
    IPV6                    : 64,   // IPV6 Flag and # of bytes

    RESPONSE_NO_ERROR       : 610,  // NO ERROR : O.K
    RESPONSE_FORMAT_ERROR   : 611,  // Message format incorrect
    RESPONSE_SERVER_FAILURE : 612,  // Server failed
    RESPONSE_NAME_ERROR     : 613,  // Name Doesn't exist
    RESPONSE_NOT_IMPLEMENTED: 614,  // Type of query not supported
    RESPONSE_NOT_AUTH       : 615,  // Not authoritative to make changes
    REQUEST_FAILED          : 616,  // Request Failed - Not specified
    REQUEST_REJECTED        : 617,  // Client Rejected by server :Respawn 3 times, then block.
    RESPONSE_DB_FAILURE     : 618,  // Database Server failed

                                    // QUERY FLAGS
    QUERY_REGULAR           : 650,  // Regular request
    QUERY_REFRESH           : 651,  // Refresh time only, Update. status
    QUERY_DNS               : 655,  // LookUP request
    QUERY_DB_TEST           : 652,  // Test DataBase
    QUERY_REQUEST           : 653,  // Regular request

    FLAG_AUTH_TRUE          : 640,  // Authorization enabled
    FLAG_AUTH_FALSE         : 641   // Authorization failure
};