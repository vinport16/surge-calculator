// writes a cookie
function setCookie(cname, cvalue, minutes) {
    var d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// reads a cookie
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

var socket = io();


socket.emit("login",prompt("password"));

socket.on("login failed", function(){
  socket.emit("login",prompt("password"));
});

socket.on("login success", function(){
  socket.emit("get contacts");
  socket.emit("get last row");
});

socket.on("contact",function(contact){
  show_contact(contact);
});

document.getElementById("get-data").addEventListener("click", function(){
  console.log("get data");
  socket.emit("get data");
});

socket.on("all data", function(data){
  console.log(data);

  out = "<table><th></th>" + make_table_header(data[0]);
  for(i in data){
    out += make_table_row(data[i]);
  }
  out += "</table>";
  document.getElementById("data-table-shell").innerHTML = out;
});

socket.on("last row", function(row){
  console.log(row);
});


socket.on("alert", function(message){
  alert(message);
});

