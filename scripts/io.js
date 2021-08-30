// writes a cookie
function setCookie(cname, cvalue, minutes) {
    var d = new Date();
    d.setTime(d.getTime() + (minutes * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + "; SameSite=None; Secure; path=/";
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

if(getCookie("pass")){
  socket.emit("login",getCookie("pass"));
}else{
  pass = prompt("password");
  setCookie("pass", pass, 60*24*7); //set cookie for one week
  socket.emit("login",pass);
}

socket.on("login failed", function(){
  pass = prompt("password");
  setCookie("pass", pass, 60*24*7); //set cookie for one week
  socket.emit("login",pass);
});

socket.on("login success", function(){
  socket.emit("get last row");
});

socket.on("contact",function(contact){
  show_contact(contact);
});

document.getElementById("get-data").onclick = function(){ socket.emit("get data"); };

socket.on("all data", function(data){

  out = "<table><th></th>" + make_table_header(data[0]);
  for(i in data){
    out += make_table_row(data[i]);
  }
  out += "</table>";
  document.getElementById("data-table-shell").innerHTML = out;
});

socket.on("deleted row",function(){
  socket.emit("get data");
});

socket.on("last row", function(row){
  prepare_input_fields(row);
});

socket.on("logged row", function(){
  clear_input_fields();
});

socket.on("disconnect", function(reason){
  alert("Communication with server disconnected: " + reason + "\nRefresh the page to submit or retrieve data");
})

socket.on("alert", function(message){
  alert(message);
});

delete_row = function(id){
  if(confirm("delete this row? this action cannot be undone")){
    socket.emit("delete data",id);
  }
}

