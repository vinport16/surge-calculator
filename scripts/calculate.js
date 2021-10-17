level_to_color = ["green","yellow","red","black"];

// outputs [surge_score, surge_level, surge_color]
// note: waitTime is in minutes
calculate_surge_score = function(occupancy, nedoc, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients){

  // first calculate score
  score = 0;

  if(occupancy > 90){
    score += 10;
  }

  if(nedoc > 180){
    score += 5;
  }else if(nedoc > 140){
    score += 4;
  }else if(nedoc > 100){
    score += 3;
  }else if(nedoc > 60){
    score += 2;
  }else if(nedoc > 20){
    score += 1;
  }

  if(arrivals3hours > 20 || arrivals1pm > 175){
    score += 10;
  }

  if(admitNoBed > 19){
    score += 10;
  }else if(admitNoBed > 9){
    score += 5;
  }

  if(icuBeds < 6){
    score += 15;
  }

  if(waiting > 50){
    score += 30;
  }else if(waiting > 39){
    score += 20;
  }else if(waiting > 19){
    score += 10;
  }

  if(waitTime > 120){
    score += 10;
  }

  if(esi2noBed > 9){
    score += 20;
  }else if(esi2noBed > 4){
    score += 10;
  }

  if(critCarePatients > 13){
    score += 20;
  }else if(critCarePatients > 9){
    score += 10;
  }

  // now that we have the score, find the level
  level = 0;

  if(score > 64){
    level = 3;
  }else if(score > 40){
    level = 2;
  }else if(score > 20){
    level = 1;
  }else{
    level = 0;
  }

  // get the color:
  color = level_to_color[level];

  return [score,level,color];

}

// check if all the data is entered,
// pass it into the calculate function,
// show the result on the page
calculate = function(){
  occupancy = document.getElementById("occupancy"); 
  nedoc = document.getElementById("nedoc");
  arrivals3hours = document.getElementById("arrivals3hours");
  arrivals1pm = document.getElementById("arrivals1pm");
  admitNoBed = document.getElementById("admitNoBed");
  icuBeds = document.getElementById("icuBeds");
  waiting = document.getElementById("waiting");
  waitTimeHours = document.getElementById("waitTimeHours");
  waitTimeMinutes = document.getElementById("waitTimeMinutes");
  esi2noBed = document.getElementById("esi2noBed");
  critCarePatients = document.getElementById("critCarePatients");

  all_filled = true;

  messages = [];

  if(!validInput(occupancy)){
    all_filled = false;
    messages.push("occupancy outside valid range");
  }

  if(!validInput(nedoc)){
    all_filled = false;
    messages.push("nedoc outside valid range");
  }

  if(!validInput(arrivals3hours)){
    all_filled = false;
    messages.push("arrivals3hours outside valid range");
  }

  now = new Date();
  if(!validInput(arrivals1pm) && ( now.getHours() < 6 || now.getHours() >= 13 ) ){
    all_filled = false;
    messages.push("arrivals1pm outside valid range");
  }

  if(!validInput(admitNoBed)){
    all_filled = false;
    messages.push("admitNoBed outside valid range");
  }

  if(!validInput(icuBeds)){
    all_filled = false;
    messages.push("icuBeds outside valid range");
  }

  if(!validInput(waiting)){
    all_filled = false;
    messages.push("waiting outside valid range");
  }

  if(waitTimeMinutes.value > 59){
    all_filled = false;
    alert("Invalid time: minutes cannot exceed 59");
    waitTimeMinutes.value = null;
  }

  waitTime = waitTimeHours.value * 60 + waitTimeMinutes.value;
  if(emptyInput(waitTime)){
    all_filled = false;
    messages.push("waitTime not filled in");
  }

  if(!validInput(esi2noBed)){
    all_filled = false;
    messages.push("esi2noBed outside valid range");
  }

  if(!validInput(critCarePatients)){
    all_filled = false;
    messages.push("critCarePatients outside valid range");
  }

  document.getElementById("error_messages").innerText = messages.join("\n")

  if(all_filled){
    score = calculate_surge_score(occupancy.value, nedoc.value, arrivals3hours.value, arrivals1pm.value, admitNoBed.value, icuBeds.value, waiting.value, waitTime, esi2noBed.value, critCarePatients.value);
    document.getElementById("surge").innerHTML = score[2];
    document.getElementById("submit").disabled = false;
    color = "";
    switch(score[1]){
      case 0:
        color = "rgb(220,255,220)";
        break;
      case 1:
        color = "rgb(255,255,220)";
        break;
      case 2:
        color = "rgb(255,220,220)";
        break;
      case 3:
        color = "rgb(220,220,220)";
        break;
    }
    document.body.style.backgroundColor = color;

    return score;
  }else{
    document.getElementById("surge").innerHTML = "finish entering data";
    document.body.style.backgroundColor = "";
    document.getElementById("submit").disabled = true;
    return false;
  }
}

function emptyInput(value){
  return value == null || value == "";
}

function validInput(element){
  empty = element.value == null || element.value == "";
  in_range = true;
  if(element.type == "number" && element.max != null){
    in_range = parseInt(element.value) <= parseInt(element.max) && parseInt(element.value) >= parseInt(element.min);
  }
  return !empty && in_range;
}

function addEvent(evnt, elem, func) {
   if (elem.addEventListener)  // W3C DOM
      elem.addEventListener(evnt,func,false);
   else if (elem.attachEvent) { // IE DOM
      elem.attachEvent("on"+evnt, func);
   }
   else { // No much to do
      elem[evnt] = func;
   }
}

addEvent("change",document.getElementById("occupancy"),function(){calculate();});
addEvent("change",document.getElementById("nedoc"),function(){calculate();});
addEvent("change",document.getElementById("arrivals3hours"),function(){calculate();});
addEvent("change",document.getElementById("arrivals1pm"),function(){calculate();});
addEvent("change",document.getElementById("admitNoBed"),function(){calculate();});
addEvent("change",document.getElementById("icuBeds"),function(){calculate();});
addEvent("change",document.getElementById("waiting"),function(){calculate();});
addEvent("change",document.getElementById("waitTimeHours"),function(){calculate();});
addEvent("change",document.getElementById("waitTimeMinutes"),function(){calculate();});
addEvent("change",document.getElementById("esi2noBed"),function(){calculate();});
addEvent("change",document.getElementById("critCarePatients"),function(){calculate();});


addEvent("click",document.getElementById("submit"),function(){
  initials = document.getElementById("initials").value;
  concordance = document.getElementById("concordance").value;
  console.log(concordance);
  if(initials == ""){
    console.log("initials not filled in");
    alert("Please include your initials");
  }else if(concordance == ""){
    console.log("concordance not filled in");
    alert("Please indicate what the surge level feels like. If it feels the same as the calculated surge level, select that level.");
  }else if(calculate()){

    level = calculate();
    surgeScore = level[0];
    surgeLevel = level[1];

    occupancy = parseInt(document.getElementById("occupancy").value); 
    nedoc = parseInt(document.getElementById("nedoc").value);
    arrivals3hours = parseInt(document.getElementById("arrivals3hours").value);
    arrivals1pm = parseInt(document.getElementById("arrivals1pm").value || 0); // in case it's blank
    admitNoBed = parseInt(document.getElementById("admitNoBed").value);
    icuBeds = parseInt(document.getElementById("icuBeds").value);
    waiting = parseInt(document.getElementById("waiting").value);
    waitTimeHours = parseInt(document.getElementById("waitTimeHours").value);
    waitTimeMinutes = parseInt(document.getElementById("waitTimeMinutes").value);

    waitTime = parseInt(waitTimeMinutes + waitTimeHours * 60);

    esi2noBed = parseInt(document.getElementById("esi2noBed").value);
    critCarePatients = parseInt(document.getElementById("critCarePatients").value);

    diversion = document.getElementById("diversion").value;
    notes = document.getElementById("notes").value;
    concordance = parseInt(document.getElementById("concordance").value);

    if(confirm("send data?")){
      row = {occupancy:occupancy, nedoc:nedoc, arrivals3hours:arrivals3hours, arrivals1pm:arrivals1pm, admitNoBed:admitNoBed, icuBeds:icuBeds, waiting:waiting, waitTime:waitTime, esi2noBed:esi2noBed, critCarePatients:critCarePatients, surgeScore:surgeScore, surgeLevel:surgeLevel, diversion:diversion, initials:initials, concordance:concordance, notes:notes};
      socket.emit("create row", row);
      show_report(row);
    }
  }
});









