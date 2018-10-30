// var express = require('express');
// var pg = require("pg");
// var app = express();
 
// var connectionString = "postgres://postgres:123@localhost:5432/postgres";
 
// app.get('/', function (req, res, next) {
//     pg.connect(connectionString,function(err,client,done) {
//        if(err){
//            console.log("not able to get connection "+ err);
//            res.status(400).send(err);
//        } 
//        client.query('SELECT * FROM student where id = $1', [1],function(err,result) {
//            done(); // closing the connection;
//            if(err){
//                console.log(err);
//                res.status(400).send(err);
//            }
//            res.status(200).send(result.rows);
//        });
//     });
// });
 
// app.listen(4000, function () {
//     console.log('Server is running.. on Port 4000');
// });


var express = require('express');
var app = express();
var pgp = require("pg-promise")(/*options*/);
var db = pgp("postgres://postgres:Tutctirz32@localhost:5432/postgres");
var port = process.env.PORT || 8080;


app.get('/', function(request, response) {
  db.any("SELECT * FROM statistic")
    .then(function(data){
      console.log("DATA:", data);
      response.status(200).send(data);
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });
});

app.listen(port, function(){
  console.log('Express server listening on port ' + port);
});