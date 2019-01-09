var express = require('express');
var sio = require('socket.io');
var pg = require('pg');
var fs = require('fs');
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

// set EMAIL_PASSWORD in heroku config variables OR get it from command line argument
var EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || process.argv[2];

// set time zone (# hours of offset)
var TIMEZONE_OFFSET = -5;

// initial database connection settings
var config = {
    "connectionString": process.env.DATABASE_URL || "postgres://localhost:5432",
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

app.post('/download', function(req,res){
  if(req.headers.cookie.includes("pass="+PASSWORD) ){
    config["stream"] = new net.Stream();
    pool = new pg.Pool(config);
    pool.connect(function(err, client, done){
      if(err) {
        return console.error('error fetching client from pool', err);
      }
      client.query('SELECT * FROM data ORDER BY ID DESC', function(err, result) {
        if (err) throw err;

        content = result.rows;

        surge_levels = ["green","yellow","red","black"];

        var text = "";

        // make column headers
        row = content[0];
        text += "date, ";
        text += "time, ";
        for(key in row){
          if(row.hasOwnProperty(key)){
            if(key == "date"){
              // put date at the beginning
            }else if(key == "notes"){
              // put notes at the end
            }else{
              text += key+", ";
            }
          }
        }
        text += "notes\n";


        // add data

        for(i in content){
          row = content[i];
          // do date first
          date = new Date(Date.parse(row.date));
          // date is in UTC on production, so if we're on prod, change to EST:
          if(PASSWORD != "pass"){
            date.setHours(date.getHours()+TIMEZONE_OFFSET);
          }
          text += date.toDateString()+", ";
          text += date.toTimeString().split(" ")[0]+", ";
          for(key in row){
            if(row.hasOwnProperty(key)){
              if(key == "date"){
                // do date at beginning
              }else if(key == "surgelevel" || key == "concordance" && row[key] != null){
                text += surge_levels[row[key]]+", ";
              }else if(key == "notes"){
                // put notes at the end
              }else{
                text += row[key]+", ";
              }
            }
          }
          text += replace_all(replace_all(row.notes,",","/"),"\n"," ")+"\n";
        }

        fs.writeFile ("surge_calculator_data.csv", text, function(err) { //write data back into file
          if (err) throw err;
          var file = __dirname + '/surge_calculator_data.csv';
          res.download(file);     // here's where the download happens
        });


        done();
      });
    });
    pool.end();
  }else{

  }
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
            socket.emit("logged row");
            notify_everyone(row);
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
            console.log("retrieved row "+row.id+": Score="+row.surgescore);
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

  socket.on("delete data", function(id){
    if(socket.auth){
      config["stream"] = new net.Stream();
      pool = new pg.Pool(config);
      pool.connect(function(err, client, done){
        if(err) {
          socket.emit("alert","failed to delete");
          return console.error('error fetching client from pool', err);
        }
        client.query('DELETE FROM data WHERE id = $1', [id], function(err, result) {
          console.log("deleted row: id "+id);
          socket.emit("deleted row");
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






// replace all instances of 'find' in string with 'replace'
replace_all = function(string, find, replace){
  while(string.includes(find)){
    string = string.replace(find,replace);
  }
  return string;
}

// sends emails
// addr: list of recipients
// body: text of message
send_alert = function(addr, body){
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'surge.management.robot@gmail.com',
      pass: EMAIL_PASSWORD
    }
  });

  // setup email data with unicode symbols
  let mailOptions = {
    from: '"Surge Management Robot" <surge.management.robot@gmail.com>', // sender address
    to: addr,    // list of receivers
    subject: '',  // Subject line
    text: body,   // plain text body
    ecoding: "base64"
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Message to %s sent: %s', addr, info.response);
  });
};

minutes_to_time_string = function(min){
  str = "";
  if(parseInt(min/60) > 0){
    str += parseInt(min/60);
  }else{
    str += "0";
  }
  str += ":";
  min = min%60;
  if(min > 9){
    str += min;
  }else if(min > 0){
    str += "0";
    str += min;
  }else{
    str += "00";
  }
  return str;
}

level_to_color = ["green","yellow","red","black"];

// notifies all the appropriate people for a surge report
notify_everyone = function(row){

  config["stream"] = new net.Stream();
  pool = new pg.Pool(config);
  pool.connect(function(err, client, done){
    if(err) {
      return console.error('error fetching client from pool', err);
    }
    client.query('SELECT * FROM contacts', function(err, result) {
      contacts = result.rows;
      // only send to contacts who have sufficeintly low thresholds
      contacts = contacts.filter(contact => contact.threshold <= row.surgeLevel );
      emails = contacts.map(function(contact){ return contact.email; });

      lines = [];
      lines.push("Surge Level: "+level_to_color[row.surgeLevel]);
      lines.push("Census: "+row.census);
      lines.push("Arrivals 3hrs: "+row.arrivals3hours);
      lines.push("Arrivals 1pm: "+row.arrivals1pm);
      lines.push("Admit w/o bed: "+row.admitNoBed);
      lines.push("ICU beds: "+row.icuBeds);
      lines.push("Waiting: "+row.waiting);
      lines.push("Longest wait: "+minutes_to_time_string(row.waitTime));
      lines.push("ESI2 w/o bed: "+row.esi2noBed);
      lines.push("ED is "+row.diversion);
      lines.push("Surge Score: "+row.surgeScore);
      lines.push("Notes: "+row.notes);

      while(lines.length > 0){
        text_body = lines.shift();
        while(lines.length > 0 && text_body.length + lines[0].length + 1 <= 110){
          text_body += "\n"+lines.shift();
        }

        if(emails.length > 0){
          send_alert(emails, text_body);
        }
      }

      done();
    });
  });
  pool.end();

};






