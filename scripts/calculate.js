level_to_color = ["green","yellow","red","black"];

// outputs [surge_score, surge_level, surge_color]
// note: waitTime is in minutes
calculate_surge_score = function(census, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients){
  
  // first calculate score
  score = 0;

  if(census > 539){
    score += 10;
  }

  if(arrivals3hours > 59 || arrivals1pm > 159){
    score += 10;
  }

  if(admitNoBed > 24){
    score += 15;
  }else if(admitNoBed > 9){
    score += 10;
  }

  if(icuBeds < 6){
    score += 15;
  }

  if(waiting > 49){
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

  if(critCarePatients > 12){
    score += 20;
  }else if(critCarePatients > 9){
    score += 10;
  }

  // now that we have the score, find the level
  level = 0;

  if(score >= 65){
    level = 3;
  }else if(score >= 40){
    level = 2;
  }else if(score >= 20){
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

  if(census.value == null){
    all_filled = false;
    console.log("census not filled in");
  }

  if(arrivals3hours.value == ""){
    all_filled = false;
    console.log("arrivals3hours not filled in");
  }

  if(arrivals1pm.value == ""){
    all_filled = false;
    console.log("arrivals1pm not filled in");
  }

  if(admitNoBed.value == ""){
    all_filled = false;
    console.log("admitNoBed not filled in");
  }

  if(icuBeds.value == ""){
    all_filled = false;
    console.log("icuBeds not filled in");
  }

  if(waiting.value == ""){
    all_filled = false;
    console.log("waiting not filled in");
  }

  waitTime = waitTimeHours * 60 + waitTimeMinutes;
  if(waitTime == ""){
    all_filled = false;
    console.log("waitTime not filled in");
  }

  if(esi2noBed.value == ""){
    all_filled = false;
    console.log("esi2noBed not filled in");
  }

  if(critCarePatients.value == ""){
    all_filled = false;
    console.log("critCarePatients not filled in");
  }

  if(all_filled){
    score = calculate_surge_score(census.value, arrivals3hours.value, arrivals1pm.value, admitNoBed.value, icuBeds.value, waiting.value, waitTime, esi2noBed.value, critCarePatients.value);
    document.getElementById("surge").innerHTML = score[2];
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

    return false;
  }
}

document.getElementById("census").addEventListener("change", function(){calculate();}); 
document.getElementById("arrivals3hours").addEventListener("change", function(){calculate();});
document.getElementById("arrivals1pm").addEventListener("change", function(){calculate();});
document.getElementById("admitNoBed").addEventListener("change", function(){calculate();});
document.getElementById("icuBeds").addEventListener("change", function(){calculate();});
document.getElementById("waiting").addEventListener("change", function(){calculate();});
document.getElementById("waitTimeHours").addEventListener("change", function(){calculate();});
document.getElementById("waitTimeMinutes").addEventListener("change", function(){calculate();});
document.getElementById("esi2noBed").addEventListener("change", function(){calculate();});
document.getElementById("critCarePatients").addEventListener("change", function(){calculate();});


document.getElementById("submit").addEventListener("click",function(){
  initials = document.getElementById("initials").value;

  if(initials == ""){
    console.log("initials not filled in");
    alert("please include your initials");
  }else if(calculate()){

    level = calculate();
    surgeScore = level[0];
    surgeLevel = level[1];

    census = parseInt(document.getElementById("census").value); 
    arrivals3hours = parseInt(document.getElementById("arrivals3hours").value);
    arrivals1pm = parseInt(document.getElementById("arrivals1pm").value);
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
      socket.emit("create row",{census, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients, surgeScore, surgeLevel, diversion, initials, concordance, notes});
    }
  }
});









