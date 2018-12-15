var express = require('express');
var sio = require('socket.io');
var pg = require('pg');
var net = require('net');
var nodemailer = require('nodemailer');
var app = express();
var http = require('http').createServer(app);
var io = sio(http);

// runs on heroku or localhost:8080
var port = process.env.PORT || 8080;
http.listen(port);

// set PASSWORD in heroku config variables
var PASSWORD = process.env.PASSWORD || "pass";

// initial database connection settings
var config = {
    "host": process.env.DATABASE_URL || 'localhost',
    "port": 5432,
    "database": "vincent",
    "stream": new net.Stream()
};
var pool = new pg.Pool(config);
pool.connect(function(err, client, done){
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  // if there is not a contacts table, then create one
  client.query('CREATE TABLE IF NOT EXISTS contacts(id SERIAL PRIMARY KEY, name VARCHAR, email VARCHAR, threshold INT)', function(err, result){
    done();
  });
});
pool.end();


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
      socket.emit("login success");
    }else{
      socket.emit("login failed");
    }
  });

  socket.on("get setup", function(){
    if(socket.auth){
      socket.emit("contact",{id:0,name:"Vincent",email:"vinport16@gmail.com",threshold:2});
      socket.emit("contact",{id:0,name:"Sarah",email:"sxd100@case.edu",threshold:3});
      socket.emit("contact",{id:0,name:"Dave",email:"dave.portelli@gmail.com",threshold:1});
    }else{
      socket.emit("login failed");
    }
  });

  socket.on("get contacts", function(){
    if(socket.auth){

      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('SELECT * FROM contacts ORDER BY id', function(err, result) {
          contacts = result.rows;

          for(var i = 0; i < contacts.length; i++){
            socket.emit("contact",{id:contacts[i].id,name:contacts[i].name,email:contacts[i].email,threshold:contacts[i].threshold});
          }

          done();
        });
      });
      pool.end();

    }else{
      socket.emit("login failed");
    }
  });

  socket.on("update contact", function(contact){
    if(socket.auth){

      id = contact.id;
      threshold = contact.threshold;

      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('UPDATE contacts SET threshold = $1 WHERE id = $2', [threshold,id], function(err, result) {
          done();
        });
      });
      pool.end();

    }else{
      socket.emit("login failed");
    }
  });

  socket.on("delete contact", function(id){
    if(socket.auth){

      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('DELETE FROM contacts WHERE id = $1', [id], function(err, result) {
          done();
        });
      });
      pool.end();

    }else{
      socket.emit("login failed");
    }
  });

  socket.on("disconnect", function(){
    console.log("socket disconnected");
  });
});




















