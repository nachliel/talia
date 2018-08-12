/*
// Found record, need to look for peer:
app.debug('Found record!');
// Set number in the array of the IP - Not found : -1
let flagFoundIP = -1;
// console.log(doc.peers);
// console.log(newDoc.peers[0].address);
// Search in peers of network for equal IP address
for(let i = 0; i < doc.peers.length; i++) {
    // Update record
    if (doc.peers[i].address === newDoc.peers[0].address) {
        app.debug('Peer found... updating');
        flagFoundIP = i;
        doc.peers[i] = newDoc.peers[0];
        respon.code = app.constants.STATUS_NEW_UPDATE;
        break;
    }
}
// If IP is not exist in network -> add it.
if (flagFoundIP < 0) {
    app.debug('Add new record to: ' + doc.networkName);
    doc.peers[doc.peers.length] = newDoc.peers[0];
    respon.code = app.constants.STATUS_NEW_PEER;

    //  Update new Peer in DB:
    dbs.pexDB.updateOne({_id : newDoc._id},{ $push: {peers : newDoc.peers[0]} }, function(err, res) {
        // err:
        if (err) throw err;
        app.debug(newDoc.networkName + ': IP Inserted.');

    });
}
else { // IP exist in Network need to update the record:
        let textUpdate = 'peers.' + flagFoundIP;
        dbs.pexDB.updateOne({_id : newDoc._id, 'peers.address' : newDoc.peers[0].address},{ $set: { 'peers.$' : newDoc.peers[0]} }, function(err, res) {
            // err:
            if (err) throw err;
            app.debug(newDoc.networkName + ': IP updated.');
        });

}

                        app.error('No peer...');
                        // Push new peer to DataBase
                        dbs.pexDB.findOneAndUpdate({_id : newDoc._id},{ $push: {peers : newDoc.peers[0]} }, function(err, resultSecond) {
                            // TODO: Error handling.
                            if (err) throw err;
                            app.debug(newDoc.networkName + '- Peer Inserted.');
                            console.log(resultSecond.doc);

                        });*/