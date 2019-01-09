console.log("loaded linear test calculate js!");

level_to_color = ["green","yellow","red","black"];

// outputs [surge_score, surge_level, surge_color]
// note: waitTime is in minutes
calculate_surge_score = function(census, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients){
  
  /*
  x(B2 > 570,20, if( B2 > 560, 15, if( B2 > 539, 10, 0)))
  x( OR(C2 > 39, D2 > 159), 10, 0)
  x( E2 > 35, 20, if(E2 > 24, 15, if(E2 > 9, 10, 0)))
  x(F2 < 6, 15, 0)
  x(G2 > 49, 30, if(G2 > 39, 20,if(G2 > 19, 10, 0)))
  x(H2 >= 6, 20, if(H2 >= 4, 15, if(H2 >= 2, 10, 0))
  (I2 > 12, 25, if(I2 > 9, 10, 0)))
  */

  // first calculate score
  score = 0;

  if(census > 530){
    score += (census-530)*0.5;
  }

  // !!! not linearized
  if(arrivals3hours > 59 || arrivals1pm > 159){
    score += 10;
  }

  score += admitNoBed * 0.6;

  if(icuBeds < 10){
    score += (10-icuBeds)*1.5;
  }

  if(waiting > 10){
    score += (waiting-10)
  }

  score += (waitTime/60)*3;

  score += esi2noBed * 2;

  if(critCarePatients > 5){
    score += (critCarePatients-5) * 2
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

  now = new Date();
  if(arrivals1pm.value == "" && ( now.getHours() < 6 || now.getHours() >= 13 ) ){
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
      socket.emit("create row",{census, arrivals3hours, arrivals1pm, admitNoBed, icuBeds, waiting, waitTime, esi2noBed, critCarePatients, surgeScore, surgeLevel, diversion, initials, concordance, notes});
    }
  }
});









