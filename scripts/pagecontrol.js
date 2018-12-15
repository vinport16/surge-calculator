/*

contact:
  - id
  - name
  - email
  - alert threshold

row:
  - census
  -

*/

surge_levels = ["green","yellow","red","black"];

surge_level_select = function(id, level){
  html  = "<select id='"+id+"'>";
  for(var i = 0; i < surge_levels.length; i++){
    if(i == level){
      html += "<option selected value='"+i+"'>"+surge_levels[i]+"</option>";
    }else{
      html += "<option value='"+i+"'>"+surge_levels[i]+"</option>";
    }
  }
  html += "</select>";
  return html;
}

show_contact = function(contact){
  html  = "<br><div class='spacer'></div><div class='contact' id='contact_"+contact.id+"'>";
  html += contact.name+"<br>";
  html += contact.email+"<br>";
  html += "alert when "+surge_level_select("contact_"+contact.id+"_threshold", contact.threshold) + "<br>";
  html += "<button onclick='update_contact("+contact.id+")'>Update</button>";
  html += "<button onclick='delete_contact("+contact.id+")'>Delete</button>";
  html += "</div>";
  document.getElementById("contacts").insertAdjacentHTML("beforeend", html);
}

update_contact = function(id){
  threshold = document.getElementById("contact_"+id+"_threshold").value;
  socket.emit("update contact",{id:id,threshold:threshold});
}

delete_contact = function(id){
  if(confirm("Are you sure that you want to delete this contact?")){
    socket.emit("delete contact",id); 
    contact = document.getElementById("contact_"+id);
    contact.parentNode.removeChild(contact);
  }
}

create_contact = function(contact){

}








