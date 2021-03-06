const fs = require('fs');
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    port = process.env.PORT || 8090;

var io = require('socket.io')(server);


app.get('/', function(request, response) {
  // get config: <server_address>/?config=config_name.json
  var configJSON = JSON.parse(fs.readFileSync(request.query.config));
  // we need to combine responses from all dbs and tables
  var responseCombined = [];
  response.header('Access-Control-Allow-Origin', '*');

  // for each config entry we're going to create a promise
  var dbPromises = configJSON.map((entry) => {
    return new Promise((resolve, reject) => {
      if (entry.type === "MongoDB") {
        var MongoClient = require('mongodb').MongoClient;
        MongoClient.connect(
            "mongodb://"
            + entry.config.username + ":" 
            + entry.config.password + "@" 
            + entry.config.address + "/" 
            + entry.config.name,

          { useNewUrlParser: true },

          function (err, client) {
            if (err) {
              reject(err);
              return;
            }

            var db = client.db(entry.config.name);

            // for each collection in config, we're going to apply the config filters and add that data to the combined response
            var collectionPromises = entry.config.filterList.map((item) => {
              return new Promise((resolve, reject) => {
                db.collection(item.collection)
                  .find(item.query, item.projection)
                  .toArray(
                    function (err, data) {
                      if (err) {
                        reject(err);
                      }
                      else {
                        responseCombined.push(data);
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
      else if (entry.type === "PostgreSQL") {
        var params = "postgres://" 
          + entry.config.username + ":" 
          + entry.config.password + "@" 
          + entry.config.address + "/" 
          + entry.config.name;
        
        var pgp = require("pg-promise")();
        var db = pgp(params);

        // for each table in config, we're going to apply the config filters and add that data to the combined response
        var tablePromises = entry.config.filterList.map((item) => {
          return new Promise((resolve, reject) => {
            db.any(item.query + " FROM " + item.table + " " + item.filter)
              .then(data => {
                responseCombined.push(data);
                resolve();
              })
              .catch(err => reject(err));
          })
        })

        Promise.all(tablePromises)
          .then(() => pgp.end())
          .then(() => resolve())
          .catch((err) => reject(err));
      }
      else if (entry.type === "XML") {
        // var data = require('xml-js')
        //   .xml2json(
        //     entry.config.address + "/" 
        //     + entry.config.name, 
        //     { compact: true, spaces: 4 }
        //   );
        
        // responseCombined.push(data);

        resolve();
      }
      else if (entry.type === "CSV") {
        // function csvJSON(csv) {
        //   var lines = csv.split("\n");
        //   var result = [];
        //   var headers = lines[0].split(",");

        //   for (var i = 1; i < lines.length; i++){

        //     var obj = {};
        //     var currentline = lines[i].split(",");

        //     for (var j = 0; j < headers.length; j++)
        //       obj[headers[j]] = +currentline[j];
            
        //     result.push(obj);
        //   }
          
        //   return JSON.stringify(result);
        // }

        // var csv = csvJSON(entry.config.address + "/" + entry.config.name);

        resolve();
      }
    });
  });

  // when all promises are resolved, we return the combined response
  Promise.all(dbPromises)
          .then(() => response.json(responseCombined))
          .catch((err) => response.send(err));
});

server.listen(port, function() {
  console.log('Listening on http://127.0.0.1:' + port);
});

// var pg = require ('pg');
// let pg_Client;
// var con_string = "postgres://postgres:12345678@localhost:5432/weather";
// const pool = new pg.Pool({
//       connectionString: con_string,
//     });

// pool.connect((err, client) => {
//       if(err) {
//         console.log(err);
//       }
//       pg_client = client;
//       pg_client.on('weather_rec', function(title) {
//             socket.emit('update', { message: title });
//         });
//     });

var pg = require ('pg');

var con_string = "postgres://postgres:12345678@localhost:5432/weather";

var pg_client = new pg.Client({
	host: 'localhost',
  	port: 5432,
  	user: 'postgres',
  	password: '12345678',
}
//con_string
);
pg_client.connect();
//ar query = pg_client.query('LISTEN weather_rec');

io.sockets.on('connection', function (socket) {
    socket.emit('connected', { connected: true });

    socket.on('ready for data', function (data) {
        //pg_client.on('notification', function(title) {
           // socket.emit('update', { message: title });
        //});
    });
});

//var pool = new pg.Pool(config);
// //'tcp://username:password@localhost/dbname';

//var pg_client = new pg.Client(con_string);
// pg_client.connect((err) => {
//   if (err) {
//     console.error('connection error', err.stack)
//   } else {
//     console.log('connected')
//   }
// })

//var query = pg_client.query('LISTEN weather_rec');

// io.sockets.on('connection', function (socket) {
//     socket.emit('connected', { connected: true });

//     socket.on('ready for data', function (data) {
//         // pg_client.on('notification', function(title) {
//         //     socket.emit('update', { message: title });
//         // });
//     });
// });
// io.sockets.on('connection', function (socket) {
// 	socket.on('eventServer', function (data) {
// 		console.log(data);
// 		socket.emit('eventClient', { data: 'Hello Client' });
// 	});
// 	socket.on('disconnect', function () {
// 		console.log('user disconnected');
// 	});
// });


// var WebSocketServer = require("ws").Server;
// var wss = new WebSocketServer({ server: server });
// wss.on("connection", function (ws) {
//    console.log("websocket connection open");
//    ws.on('message', function(message) {
//     console.log('получено сообщение ' + message);
// 	});
//     ws.send('something');
    
// });

// var params = "postgres://" 
//   + entry.config.username + ":" 
//   + entry.config.password + "@" 
//   + entry.config.address + "/" 
//   + entry.config.name;

// var pgp = require("pg-promise")();
// var db = pgp(params);
// db.connect();
// io.sockets.on('connection', function (socket) {
//     socket.emit('connected', { connected: true });

//     socket.on('ready for data', function (data) {
//         db.on('notification', function(title) {
//             socket.emit('update', { message: title });
//         });
//     });
// });

// // for each table in config, we're going to apply the config filters and add that data to the combined response
// var tablePromises = entry.config.filterList.map((item) => {
//   return new Promise((resolve, reject) => {
//     db.any(item.query + " FROM " + item.table + " " + item.filter)
//       .then(data => {
//         responseCombined.push(data);
//         resolve();
//       })
//       .catch(err => reject(err));
//   })
// })
