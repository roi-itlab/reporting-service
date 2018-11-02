const cn = {
    host: 'localhost',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'xxxxxxxx'
};

var express = require('express');
var app = express();
var pgp = require("pg-promise")(cn);
// var db = pgp("postgres://postgres:xxxxxxx@localhost:5432/postgres");
var port = process.env.PORT || 8080;

var testCSV =
'x,y\n' +
'3,1\n' +
'4,2\n' +
'7,3\n' +
'8,4\n' +
'1,5\n' +
'2,6\n' +
'7,7\n' +
'3,8';

var xml =
'<?xml version="1.0" encoding="utf-8"?>' +
'<note importance="high" logged="true">' +
'    <title>Happy</title>' +
'    <y>2</y>' +
'    <y>4</y>' +
'    <y>7</y>' +
'    <y>2</y>' +
'    <y>3</y>' +
'    <y>1</y>' +
'    <y>6</y>' +
'    <y>5</y>' +
'    <x>2</x>' +
'    <x>4</x>' +
'    <x>7</x>' +
'    <x>2</x>' +
'    <x>3</x>' +
'    <x>1</x>' +
'    <x>6</x>' +
'    <x>5</x>' +
'</note>';


var convert = require('xml-js');
var result1 = convert.xml2json(xml, {compact: true, spaces: 4});
var result2 = convert.xml2json(xml, {compact: false, spaces: 4});

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;


app.get('/sql', function(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  db.any("SELECT * FROM statistic")
    .then(function(data){
      var myJsonString = JSON.stringify(data);
      response.status(200).send(myJsonString);
    })
    .catch(function (error) {
        console.log("ERROR:", error);
    });
});

app.get('/csv', function(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  var csv = csvJSON(testCSV);
  response.status(200).send(csv);
  console.log(csv)
});

app.get('/xml', function(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  console.log(result1)
  response.status(200).send(result1);
});

app.listen(port, function(){
  console.log('Express server listening on port ' + port);
});

function csvJSON(csv){
  var lines = csv.split("\n");
  var result = [];
  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++){

    var obj = {};
    var currentline = lines[i].split(",");

    for (var j = 0; j < headers.length; j++)
      obj[headers[j]] = +currentline[j];
    
    result.push(obj);
  }
  
  console.log(result)
  return JSON.stringify(result);
}