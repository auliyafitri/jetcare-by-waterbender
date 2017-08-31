var MongoClient = require('mongodb').MongoClient;
var uri = "mongodb://afitri:afitri17@afitri-db-shard-00-00-xreqx.mongodb.net:27017,afitri-db-shard-00-01-xreqx.mongodb.net:27017,afitri-db-shard-00-02-xreqx.mongodb.net:27017/jetcare?ssl=true&replicaSet=afitri-db-shard-0&authSource=admin";
var currentUnixTime = Math.floor((new Date()).getTime() / 1000);
var lastTS = new Date(0);
var totalBusyDuration = 0;
var updatedRuntime = 0;

MongoClient.connect(uri, function(err, db) {
    // Paste the following examples here
    if (err) throw err;

    var lastTS = new Date(0);
    var totalBusyDuration = 0;
    var updatedRuntime = 0;
    
    //call starter function of all functions
    getLastTS();

    db.close();
    
});

function connectToUpdate() {
    MongoClient.connect(uri, function(err, db) {
        // Paste the following examples here
        if (err) throw err;
        getLastTS();
        
        db.close();
            
    }); 
}

//query timestamp of last updated data
function getLastTS() {
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        db.collection("component_runtime").find({}).toArray(function(err, result) {
            if (err) throw err;
            
            //console.log("test1 " + result[0].tstamp);
            //console.log("test2 " + new Date(result[0].tstamp));
            
            lastTS = new Date(result[0].tstamp);
            
            getRuntime(lastTS);

        });
        db.close();
    });    
}

//calculate how long machine has been running since last time lastTS
function getRuntime(lastTS) {
    //create variable to set next window
    var nextTS = new Date(lastTS);
    //nextTS.setMonth(nextTS.getMonth() + 1); 
    nextTS.setDate(nextTS.getDate() + 2); 
    
    //console.log("SEND " + lastTS + " RECEIVE " + nextTS);

    var myquery = {EndDate: {"$gte": new Date(lastTS), "$lt": new Date(nextTS)}};
    console.log(myquery);

    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        db.collection("machine_usage").find(myquery).toArray(function(err, result) {
            if (err) throw err;
            var totalBusyDuration = 0;
            for (var i=0; i<result.length; i++) {
                totalBusyDuration = totalBusyDuration + result[i].BusyDuration;
            }

            console.log(totalBusyDuration);
            console.log("HERE");

            updateRuntimeComp(totalBusyDuration, nextTS);
        });
        
        db.close();
    });
}

//query data then update each component's runtime
function updateRuntimeComp(totalBusyDuration, nextTS) {
    var percentageUsed = 0;
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;
        db.collection("component_runtime").find({}).toArray(function(err, result) {
            if (err) throw err;
            var updatedCompArr = result.slice(0);
            
            for (var i=0; i<result.length; i++) {
                updatedRuntime = result[i].runtime + totalBusyDuration;
                
                updatedCompArr[i].runtime = updatedRuntime;
                updatedCompArr[i].tstamp = nextTS;

                percentageUsed = updatedRuntime/result[i].lifetime;
                if ((percentageUsed) >= 0.75 ) {
                    console.log('Runtime is more than 75% of lifetime, should send notification for ' + result[i].item)
                    console.log(secondsToHms(result[i].lifetime - updatedRuntime))
                    console.log(updatedRuntime + " -VS- " + result[i].lifetime)
                } else {
                    console.log('NOT YET! Just updated the value');
                    console.log(secondsToHms(result[i].lifetime - updatedRuntime))
                }
            }
            
            updateData(updatedCompArr);

            //update gauges of components
            for (var i=0; i<updatedCompArr.length; i++) {
                if (updatedCompArr[i].item == 'ruby') {
                    document.getElementById("gauge-ruby").value = updatedCompArr[i].runtime;
                    document.getElementById("gauge-ruby").max = updatedCompArr[i].lifetime;
                } else if (updatedCompArr[i].item == 'nozzle') {
                    document.getElementById("gauge-nozzle").value = updatedCompArr[i].runtime;
                    document.getElementById("gauge-nozzle").max = updatedCompArr[i].lifetime;
                } else if (updatedCompArr[i].item == 'sand') {
                    document.getElementById("gauge-sand").value = updatedCompArr[i].runtime;
                    document.getElementById("gauge-sand").max = updatedCompArr[i].lifetime;
                }
            }
            
        });
        db.close();
    });

}

//update date from array val
function updateData(anArr) {
    MongoClient.connect(uri, function(err, db) {
        if (err) throw err;

        var coll = db.collection('component_runtime');

        var bulk = coll.initializeUnorderedBulkOp();
        for (var i=0; i<anArr.length; i++) {
            bulk.find( { item: anArr[i].item } ).update( { $set: { runtime: anArr[i].runtime, tstamp: anArr[i].tstamp } } );
        }
        
        bulk.execute();
        db.close();
    });
}


function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);

    var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
    var mDisplay = m > 0 ? m + (m == 1 ? " minute" : " minutes") : "";
    return hDisplay + mDisplay; 
}