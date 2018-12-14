var express = require('express');
var sio = require('socket.io');
var pg = require('pg');
var nodemailer = require('nodemailer');
var app = express();
var http = require('http').createServer(app);
var io = sio(http);

// runs on heroku or localhost:8080
var port = process.env.PORT || 8080;
http.listen(port);

// set PASSWORD in heroku config variables
var PASSWORD = process.env.PASSWORD || "pass";

/*
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432';

const client = new pg.Client(connectionString);
client.connect();

pg.connect(connectionString, function(err, client, done) {
  client.query('CREATE TABLE IF NOT EXISTS data2(id SERIAL PRIMARY KEY, date VARCHAR(60) not null, box0 INT, box1 INT, box2 INT, box3 INT, box4 INT, box5 INT, box6 INT, box7 INT, box8 INT, total INT, color VARCHAR(10), initials VARCHAR(3) )', function(err, result) {
    done();
  });
});
*/

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

app.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});

app.get('/io.js', function(req, res){
  res.sendFile(__dirname + '/scripts/io.js');
});

app.get('/pagecontrol.js', function(req, res){
  res.sendFile(__dirname + '/scripts/pagecontrol.js');
});

app.get('/calculate.js', function(req, res){
  res.sendFile(__dirname + '/scripts/calculate.js');
});

io.on("connection", function(socket){
  socket.auth = false;
  console.log("socket connected");

  socket.on("login", function(pass){
    console.log("login attempt with password: "+pass);
    if(pass === PASSWORD){
      socket.auth = true;
    }else{
      socket.emit("login failed");
    }
  });

  socket.on("data", function(){
    if(socket.auth){
      console.log("sending data");
    }else{
      socket.emit("login failed");
    }
  });

  socket.on("disconnect", function(){
    console.log("socket disconnected");
  });
});




















