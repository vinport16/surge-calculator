/*

contact:
  - id
  - name
  - email
  - alert threshold

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

make_table_header = function(row){
  tr = "<thead><tr>";
  for(key in row){
    if(row.hasOwnProperty(key)){
      if(key == "date"){
        tr += "<th class='rotate'><div><span>year</span></div></th>";
        tr += "<th class='rotate'><div><span>month</span></div></th>";
        tr += "<th class='rotate'><div><span>day</span></div></th>";
        tr += "<th class='rotate'><div><span>time</span></div></th>";
      }else{
        tr += "<th class='rotate'><div><span>"+key+"</span></div></th>";
      }
    }
  }
  tr += "</tr></thead>";
  return tr;
}

make_table_row = function(row){
  tr = "<tr class='code"+row.surgelevel+"'>";
  for(key in row){
    if(row.hasOwnProperty(key)){
      if(key == "date"){
        // split date into components
        date = new Date(Date.parse(row[key]));
        year = date.getFullYear();
        month = date.getMonth()+1;
        day = date.getDate();
        hour = date.getHours();
        minute = date.getMinutes();
        tr += "<td>"+year+"</td>";
        tr += "<td>"+month+"</td>";
        tr += "<td>"+day+"</td>";
        tr += "<td>"+hour+":"+minute+"</td>";
      }else if(key == "surgelevel" || key == "concordance" && row[key] != null){
        tr += "<td>"+surge_levels[row[key]]+"</td>";
      }else{
        tr += "<td>"+row[key]+"</td>";
      }
    }
  }
  tr += "</tr>";
  return tr;
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

show_new_contact_form = function(){
  html  = "<br><div class='spacer'></div><div class='contact' id='new_contact'>";
  html += "<input id='new_contact_name' type='text' placeholder='Name'><br>";
  html += "<input id='new_contact_email' type='text' placeholder='email address'><br>";
  html += "alert when "+surge_level_select("new_contact_threshold", 2) + "<br>";
  html += "<button onclick='save_new_contact()'>Save</button>";
  html += "<button onclick='cancel_new_contact()'>Cancel</button>";
  html += "</div>";
  document.getElementById("contacts").insertAdjacentHTML("beforeend", html);
  document.getElementById("new-contact").disabled = true;
}

save_new_contact = function(){
  name = document.getElementById("new_contact_name").value;
  email = document.getElementById("new_contact_email").value;
  threshold = document.getElementById("new_contact_threshold").value;

  socket.emit("create contact", {name:name,email:email,threshold:threshold});

  contact = document.getElementById("new_contact");
  contact.parentNode.removeChild(contact.previousSibling);
  contact.parentNode.removeChild(contact.previousSibling);
  contact.parentNode.removeChild(contact);
  document.getElementById("new-contact").disabled = false;
}

cancel_new_contact = function(){

  contact = document.getElementById("new_contact");
  contact.parentNode.removeChild(contact.previousSibling);
  contact.parentNode.removeChild(contact.previousSibling);
  contact.parentNode.removeChild(contact);
  document.getElementById("new-contact").disabled = false;
}

update_contact = function(id){
  threshold = document.getElementById("contact_"+id+"_threshold").value;
  socket.emit("update contact",{id:id,threshold:threshold});
}

delete_contact = function(id){
  if(confirm("Are you sure that you want to delete this contact?")){
    socket.emit("delete contact",id); 
    contact = document.getElementById("contact_"+id);
    contact.parentNode.removeChild(contact.previousSibling);
    contact.parentNode.removeChild(contact.previousSibling);
    contact.parentNode.removeChild(contact);
  }
}







