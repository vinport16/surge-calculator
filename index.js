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
    //"host": process.env.DATABASE_URL || 'localhost',
    //"port": 5432,
    "connectionString": process.env.DATABASE_URL || "postgres://localhost:5432",
    //"database": "vincent",
    "stream": new net.Stream()
};
var pool = new pg.Pool(config);
pool.connect(function(err, client, done){
  if(err) {
    return console.error('error fetching client from pool', err);
  }
  // if there is not a contacts table, then create one
  client.query('CREATE TABLE IF NOT EXISTS contacts(id SERIAL PRIMARY KEY, name VARCHAR, email VARCHAR, threshold INT)', function(err, result){
  });
  // if there is not a data table, then create one
  client.query('CREATE TABLE IF NOT EXISTS data(id SERIAL PRIMARY KEY, census INT, arrivals3hours INT, arrivals1pm INT, admitNoBed INT, icuBeds INT, waiting INT, waitTime INT, esi2noBed INT, critCarePatients INT, surgeScore INT, surgeLevel INT, diversion VARCHAR(15), initials VARCHAR(3), concordance INT, notes TEXT, date TIMESTAMPTZ)', function(err, result){
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


  // ~~ INTERACTIONS ON CONTACTS TABLE ~~ //


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
            socket.emit("contact",contacts[i]);
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
          console.log("updated contact "+contact.id);
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
          console.log("deleted contact "+id);
          done();
        });
      });
      pool.end();

    }else{
      socket.emit("login failed");
    }
  });

  socket.on("create contact", function(contact){
    if(socket.auth){

      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO contacts (name, email, threshold) VALUES ($1, $2, $3) RETURNING id', [contact.name, contact.email, contact.threshold], function(err, result) {
          console.log("created contact "+contact.name);
          contact.id = result.rows[0].id;
          socket.emit("contact",contact);
          done();
        });
      });
      pool.end();

    }else{
      socket.emit("login failed");
    }
  });


  // ~~ INTERACTIONS ON DATA TABLE ~~ //


  socket.on("create row", function(row){
    if(socket.auth){
      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query('INSERT INTO data (census, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients, surgeScore, surgeLevel, diversion, initials, concordance, notes, date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
                     [row.census, row.arrivals3hours, row.arrivals1pm, row.admitNoBed, row.icuBeds, row.waiting, row.waitTime, row.esi2noBed, row.critCarePatients, row.surgeScore, row.surgeLevel, row.diversion, row.initials, row.concordance, row.notes, new Date()], function(err, result) {
          if(err){
            socket.emit("alert","FAILED TO LOG ROW: "+row);
            console.log(err);
          }else{
            console.log("logged data row with surge level "+row.surgeLevel);
          }
          done();
        });
      });
      pool.end();

    }else{
      socket.emit("login failed");
    }
  });

  socket.on("get last row", function(){
    if(socket.auth){
      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query("SELECT * FROM data ORDER BY ID DESC LIMIT 1", function(err, result) {
          row = result.rows[0];
          if(row == undefined){
            console.log("no rows to retrieve");
            socket.emit("last row",false);
          }else{
            console.log("retrieved row "+row.id+": Score="+row.surgeScore);
            socket.emit("last row",row);
          }
          done();
        });
      });
      pool.end();
    }else{
      socket.emit("login failed");
    }
  });


  socket.on("get data", function(){
    if(socket.auth){
      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          return console.error('error fetching client from pool', err);
        }
        client.query("SELECT * FROM data ORDER BY ID DESC", function(err, result) {
          rows = result.rows;
          console.log("retrieved "+rows.length+" rows");
          socket.emit("all data",rows);
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




















