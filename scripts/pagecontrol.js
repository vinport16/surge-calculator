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

prepare_input_fields = function(row){
  row_date = new Date(Date.parse(row.date));
  now = new Date();

  oneday = 60 * 60 * 24 * 1000;
  if(now - row_date < oneday){
    document.getElementById("census").value = row.census;
  }else{
    document.getElementById("census").value = null;
  }

  seventeen_hours = 60 * 60 * 17 * 1000;
  if(now - row_date < seventeen_hours && ( row_date.getHours() < 6 || row_date.getHours() >= 13 ) && ( now.getHours() < 6 || now.getHours() >= 13 ) ){
    document.getElementById("arrivals1pm").value = row.arrivals1pm;
  }else{
    document.getElementById("arrivals1pm").value = null;
  }
  console.log(now - row_date < seventeen_hours, row_date.getHours() < 6 || row_date.getHours() >= 13, now.getHours() < 6 || now.getHours() >= 13);
}

clear_input_fields = function(){
  // reset /most/ of the input fields
  document.getElementById("arrivals3hours").value = null;
  document.getElementById("admitNoBed").value = null;
  document.getElementById("icuBeds").value = null;
  document.getElementById("waiting").value = null;
  document.getElementById("waitTimeHours").value = null;
  document.getElementById("waitTimeMinutes").value = null;
  document.getElementById("esi2noBed").value = null;
  document.getElementById("critCarePatients").value = null;
  document.getElementById("notes").value = null;
  document.getElementById("concordance").value = null;
  calculate();
}

make_table_header = function(row){
  tr = "<thead><tr>";
  for(key in row){
    if(row.hasOwnProperty(key)){
      if(key == "date"){
        tr += "<th class='rotate'><div><span>date</span></div></th>";
        tr += "<th class='rotate'><div><span>time</span></div></th>";
      }else if(key == "notes"){
        // put notes at the end
      }else{
        tr += "<th class='rotate'><div><span>"+key+"</span></div></th>";
      }
    }
  }
  tr += "<th class='rotate'><div><span>notes</span></div></th>";
  tr += "<th class='rotate'><div><span>delete</span></div></th>";
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
        tr += "<td>"+date.toDateString()+"</td>";
        tr += "<td>"+date.toTimeString()+"</td>";
      }else if(key == "surgelevel" || key == "concordance" && row[key] != null){
        tr += "<td>"+surge_levels[row[key]]+"</td>";
      }else if(key == "notes"){
        // put notes at the end
      }else{
        tr += "<td>"+row[key]+"</td>";
      }
    }
  }
  tr += "<td>"+row.notes+"</td>";
  tr += "<td><button onclick='delete_row("+row.id+")'>delete</button></td>";
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


// when it's between 6AM and 1PM, disable the arrivals1pm input
now = new Date();
if(now.getHours() >= 6 && now.getHours() < 13){
  document.getElementById("arrivals1pm").disabled = true;
}




