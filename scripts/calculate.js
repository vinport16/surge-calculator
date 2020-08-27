level_to_color = ["green","yellow","red","black"];

// outputs [surge_score, surge_level, surge_color]
// note: waitTime is in minutes
calculate_surge_score = function(census, nedoc, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients){

  // first calculate score
  score = 0;

  if(census > 539){
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
  census = document.getElementById("census"); 
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

  if(emptyInput(census.value)){
    all_filled = false;
    console.log("census not filled in");
  }

  if(emptyInput(nedoc.value)){
    all_filled = false;
    console.log("nedoc not filled in");
  }

  if(emptyInput(arrivals3hours.value)){
    all_filled = false;
    console.log("arrivals3hours not filled in");
  }

  now = new Date();
  if(emptyInput(arrivals1pm.value) && ( now.getHours() < 6 || now.getHours() >= 13 ) ){
    all_filled = false;
    console.log("arrivals1pm not filled in");
  }

  if(emptyInput(admitNoBed.value)){
    all_filled = false;
    console.log("admitNoBed not filled in");
  }

  if(emptyInput(icuBeds.value)){
    all_filled = false;
    console.log("icuBeds not filled in");
  }

  if(emptyInput(waiting.value)){
    all_filled = false;
    console.log("waiting not filled in");
  }

  if(waitTimeMinutes.value > 59){
    all_filled = false;
    alert("Invalid time: minutes cannot exceed 59");
  }

  waitTime = waitTimeHours.value * 60 + waitTimeMinutes.value;
  if(emptyInput(waitTime)){
    all_filled = false;
    console.log("waitTime not filled in");
  }

  if(emptyInput(esi2noBed.value)){
    all_filled = false;
    console.log("esi2noBed not filled in");
  }

  if(emptyInput(critCarePatients.value)){
    all_filled = false;
    console.log("critCarePatients not filled in");
  }

  if(all_filled){
    score = calculate_surge_score(census.value, nedoc.value, arrivals3hours.value, arrivals1pm.value, admitNoBed.value, icuBeds.value, waiting.value, waitTime, esi2noBed.value, critCarePatients.value);
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

addEvent("change",document.getElementById("census"),function(){calculate();});
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

    census = parseInt(document.getElementById("census").value); 
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
      row = {census:census, nedoc:nedoc, arrivals3hours:arrivals3hours, arrivals1pm:arrivals1pm, admitNoBed:admitNoBed, icuBeds:icuBeds, waiting:waiting, waitTime:waitTime, esi2noBed:esi2noBed, critCarePatients:critCarePatients, surgeScore:surgeScore, surgeLevel:surgeLevel, diversion:diversion, initials:initials, concordance:concordance, notes:notes};
      socket.emit("create row", row);
      show_report(row);
    }
  }
});









