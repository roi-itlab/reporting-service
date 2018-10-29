var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    port = process.env.PORT || 8080;

app.get('/', function(request, response) {
  var MongoClient = require('mongodb').MongoClient

  MongoClient.connect(
    'mongodb://localhost:27017/mock_db', 

    { useNewUrlParser: true },

    function (err, client) {
      if (err) { 
        throw err;
      }

      var db = client.db('mock_db')
      
      db.collection('currency').find({}, {projection:{_id:0}}).toArray(
        function (err, result) {
          if (err) {
            throw err;
          }

          response.json(result);
      });
    });
});

server.listen(port, function() {
  console.log('Listening on ' + port);
});