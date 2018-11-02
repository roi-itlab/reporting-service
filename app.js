const fs = require('fs');
var cors = require('cors')
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    port = process.env.PORT || 8090;

app.get('/', function(request, response) {
  var configJSON = JSON.parse(fs.readFileSync('rs_config.json'));
  var responseCombined = [];
  app.use(cors({credentials: true, origin: true}));
  response.header('Access-Control-Allow-Origin', '*');
  var dbPromises = configJSON.map((entry) => {
    return new Promise((resolve, reject) => {
      if (entry.type === "MongoDB") {
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(
          entry.config.address + "/" + entry.config.name,

          { useNewUrlParser: true },

          function (err, client) {
            if (err) {
              reject(err);
              return;
            }

            var db = client.db(entry.config.name);
            var collectionPromises = entry.config.filterList.map((filter) => {
              return new Promise((resolve, reject) => {
                db.collection(filter.collection)
                  .find(filter.query, filter.projection)
                  .toArray(
                    function (err, result) {
                      if (err) {
                        reject(err);
                      }
                      else {
                        responseCombined.push(result);
                        resolve();
                      }
                  });
                });
            });

            Promise.all(collectionPromises)
              .then(() => resolve())
              .catch((err) => reject(err));
          });
      }
    });
  });

  Promise.all(dbPromises)
          .then(() => response.json(responseCombined))
          .catch((err) => response.send(err));
});

server.listen(port, function() {
  console.log('Listening on ' + port);
});