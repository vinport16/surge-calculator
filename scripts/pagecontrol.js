/*

contact:
  - id
  - name
  - email
  - alert threshold

*/

surge_levels = ["green","yellow","red","black"];
surge_level_select = function(id, level){
  html = "<select id='"+id+"'>";
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

phone_carriers = [["Sprint","@messaging.sprintpcs.com"],["AT&T","@txt.att.net"],["T-Mobile","@tmomail.net"],["Verizon","@vtext.com"]];
phone_carrier_select = function(id){
  html = "<select id='"+id+"'>";
  for(var i = 0; i < phone_carriers.length; i++){
    html += "<option value='"+phone_carriers[i][1]+"'>"+phone_carriers[i][0]+"</option>";
  }
  html += "</select>";
  return html;
}

get_last_time_of_census = function(time){
  if(time.getHours()*60 + time.getMinutes() > 5*60 + 30){
    // time - time.getHours = midnight, + 5.5hrs = 5:30 AM
    return new Date(time - ((time.getHours()*60 + time.getMinutes())*60 + time.getSeconds())*1000 + (5.5 * 60 * 60 * 1000));
  }else{
    // time - ((24 + 5.5) hrs - time.getHours) = 5:30 AM
    return new Date(time + ((24 + 5.5) * 60 * 60 * 1000) - (((time.getHours()*60 + time.getMinutes())*60 + time.getSeconds())*1000));
  }
}

prepare_input_fields = function(row){
  row_date = new Date(Date.parse(row.date));
  now = new Date();

  oneday = 60 * 60 * 24 * 1000;
  //the time that the census was from: 5:30AM in the last 24 hrs
  timeOfCensus = get_last_time_of_census(row_date);
  if(now - timeOfCensus < oneday){
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
}

clear_input_fields = function(){
  // reset /most/ of the input fields
  document.getElementById("nedoc").value = null;
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
  tr += "<th class='rotate'><div><span>date</span></div></th>";
  tr += "<th class='rotate'><div><span>time</span></div></th>";
  for(key in row){
    if(row.hasOwnProperty(key)){
      if(key == "date"){
        // put date at the beginning
      }else if(key == "id"){
        // do not include id
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

// get surge color from level
// returns "same" when null (for concordance)
get_surge_color = function(l){
  if(l == null){
    return "same";
  }else{
    return surge_levels[l];
  }
}

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

make_table_row = function(row){
  tr = "<tr class='code"+row.surgelevel+"'>";
  // split date into components
  date = new Date(Date.parse(row.date));
  tr += "<td>"+date.toDateString()+"</td>";
  tr += "<td>"+date.toTimeString().split(" ")[0]+"</td>";
  for(key in row){
    if(row.hasOwnProperty(key)){
      if(key == "date"){
        // put date at the beginning
      }else if(key == "id"){
        // do not include id
      }else if(key == "waittime"){
        tr += "<td>"+minutes_to_time_string(row[key])+"</td>"
      }else if(key == "surgelevel" || key == "concordance"){
        tr += "<td>"+get_surge_color(row[key])+"</td>";
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
  html += "alert threshold "+surge_level_select("contact_"+contact.id+"_threshold", contact.threshold) + "<br>";
  html += "<button onclick='update_contact("+contact.id+")'>Update</button>";
  html += "<button onclick='delete_contact("+contact.id+")'>Delete</button>";
  html += "</div>";
  document.getElementById("contacts").insertAdjacentHTML("beforeend", html);
}

show_report = function(row){
  date = new Date();
  text  = "<h3>Report: "+date.toDateString()+" "+minutes_to_time_string(date.getHours()*60 + date.getMinutes())+"</h3>";
  text += "Surge Level: "+get_surge_color(row.surgeLevel)+"<br>";
  text += "AM Hosptial Census: "+row.census+"<br>";
  text += "Arrivals in the last 3 hours: "+row.arrivals3hours+"<br>";
  text += "Arrivals before 1pm: "+row.arrivals1pm+"<br>";
  text += "All admits in ED (w&w/o beds assigned): "+row.admitNoBed+"<br>";
  text += "Available ICU beds (not including CTIC or ICCU): "+row.icuBeds+"<br>";
  text += "People waiting (ambulance & public): "+row.waiting+"<br>";
  text += "Longest wait (ambulance only): "+minutes_to_time_string(row.waitTime)+"<br>";
  text += "ESI 2 waiting in public + ambulance: "+row.esi2noBed+"<br>";
  text += "Critical care patients: "+row.critCarePatients+"<br>";
  text += "Diversion status: "+row.diversion+"<br>";
  text += "Notes: "+row.notes+"<br>";
  console.log(text);

  document.getElementById("calc-shell");
  document.getElementById("report").innerHTML = text;
}

get_contacts = function(){
  button = document.getElementById("get-contacts");
  button.parentNode.removeChild(button);

  socket.emit("get contacts");
  console.log("getting contacts......");
}

show_new_contact_form = function(){
  html  = "<br><div class='spacer'></div><div class='contact' id='new_contact'>";
  html += "<input id='new_contact_name' type='text' placeholder='Name'><br>";
  html += "<input id='new_contact_phone' type='text' placeholder='phone number'><br>";
  html += "phone carrier "+phone_carrier_select("new_contact_carrier") + "<br>";
  html += "alert threshold "+surge_level_select("new_contact_threshold", 2) + "<br>";
  html += "<button onclick='save_new_contact()'>Save</button>";
  html += "<button onclick='cancel_new_contact()'>Cancel</button>";
  html += "</div>";
  document.getElementById("contacts").insertAdjacentHTML("beforeend", html);
  document.getElementById("new-contact").disabled = true;
}

save_new_contact = function(){
  name = document.getElementById("new_contact_name").value;
  phone = document.getElementById("new_contact_phone").value;
  carrier = document.getElementById("new_contact_carrier").value;
  threshold = document.getElementById("new_contact_threshold").value;

  socket.emit("create contact", {name:name,email:phone+carrier,threshold:threshold});

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




