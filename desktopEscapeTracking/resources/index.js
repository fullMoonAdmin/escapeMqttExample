// Create a client instance
let client = new Paho.MQTT.Client("192.168.3.94", 8484, "controlView");
client.onConnectionLost = onConnectionLost;
client.onMessageArrived = onMessageArrived;

const clueValue = 3;

// connect the client
client.connect({
  onSuccess: onConnect,
  userName: "fullMoonAdmin",
  password: "1990"

});

//runs checks every second and adjusts page elements 
function gameTimerCallback() {
  document.getElementById("light").style.backgroundColor = puzzleObj.puzzle1Color;
  document.getElementById('clue-number').innerHTML = clueNumber
  if (timerObj.min <= clueValue) {
    document.getElementById('use-clue').style.visibility = "hidden";
  } else {
    document.getElementById('use-clue').style.visibility = "visible";
  }
  if (clueNumber <= 0) {
    document.getElementById('undo-clue').style.visibility = "hidden";
  } else {
    document.getElementById('undo-clue').style.visibility = "visible";
  }
  if (timerObj.min <= 1) {
    document.getElementById('subtract-one').style.visibility = "hidden";
  } else {
    document.getElementById('subtract-one').style.visibility = "visible";
  }
  if (timerObj.min <= 5) {
    document.getElementById('subtract-five').style.visibility = "hidden";
  } else {
    document.getElementById('subtract-five').style.visibility = "visible";
  }
}
setInterval(gameTimerCallback, 1000);


let clueNumber = 0;

let puzzleObj = {
  "puzzle1Color": "red"
}

let timerObj = {
  "min": 60,
  "sec": 0,
  "complete": false
}

// called when the client connects
function onConnect() {
  // Once a connection has been made, make a subscription and send a message.
  console.log("Connection Established");
  client.subscribe("fullMoonEscape/toolRoom/airPuzzle/cured");
  client.subscribe("fullMoonEscape/toolRoom/timer/sec");
  client.subscribe("fullMoonEscape/toolRoom/timer/min");
  client.subscribe("fullMoonEscape/toolRoom/roomTimer");
}

// called when the client loses its connection
function onConnectionLost(responseObject) {
  if (responseObject.errorCode !== 0) {
    console.log("onConnectionLost:" + responseObject.errorMessage);
  }
}

// called when a message arrives
function onMessageArrived(message) {
  if (message.topic === "fullMoonEscape/toolRoom/timer/min") {

    const minDisplay = document.getElementById("min-display").innerHTML = message.payloadString;
  }
  if (message.topic === "fullMoonEscape/toolRoom/timer/sec") {
    const secDisplay = document.getElementById("sec-display").innerHTML = message.payloadString;
  }
  if (message.topic === "fullMoonEscape/toolRoom/airPuzzle/cured" && message.payloadString === "true") {
    puzzleObj.puzzle1 = "true";
    puzzleObj.puzzle1Color = "green";
    console.log("Air Puzzle Cured")
    client.unsubscribe("fullMoonEscape/toolRoom/airPuzzle/cured")
  };

  if (message.topic === "fullMoonEscape/toolRoom/roomTimer" && message.payloadString === "true") {
    console.log("timer start")

    bombTimer();
    document.getElementById("game-status").style.backgroundColor = "green";
    document.getElementById("game-status").innerHTML = "Game Started!";
  };
}

//clue section
const firstClue  = document.getElementById("clue1")
  firstClue.addEventListener("click", ()=>clue(1));

  const secondClue  = document.getElementById("clue2")
  secondClue.addEventListener("click", ()=>clue(2));
  
  const thirdClue  = document.getElementById("clue3")
  thirdClue.addEventListener("click", ()=>clue(3));
  
  const forthClue  = document.getElementById("clue4")
  forthClue.addEventListener("click", ()=>clue(4));

  const fifthClue  = document.getElementById("clue5")
  fifthClue.addEventListener("click", ()=>clue(5));

  const sixthClue  = document.getElementById("clue6")
  sixthClue.addEventListener("click", ()=>clue(6));

  const seventhClue  = document.getElementById("clue7")
  seventhClue.addEventListener("click", ()=>clue(7));
  
  const eigthClue  = document.getElementById("clue8")
  eigthClue.addEventListener("click", ()=>clue(8));
  
  function clue (num) {
    client.publish("SPM/2022.991.001/set/mirrorInboundCommand", `triggerClue${num}`);
  }

// timer system runs every second
function bombTimer() {
  const Timer = setInterval(timerCallback, 1000);

  const useClue = document.getElementById("use-clue")
  useClue.addEventListener("click", Clue);

  const undoClue = document.getElementById("undo-clue")
  undoClue.addEventListener("click", redoClue);

  const plusMin = document.getElementById("add-one")
  plusMin.addEventListener("click", addMin);

  const minusMin = document.getElementById("subtract-one")
  minusMin.addEventListener("click", subtractMin);

  const plusFiveMin = document.getElementById("add-five")
  plusFiveMin.addEventListener("click", addFiveMin);

  const minusFiveMin = document.getElementById("subtract-five")
  minusFiveMin.addEventListener("click", subtractFiveMin);

  

  function timerCallback() {

    if (timerObj.sec.toString() < 10) {
      client.publish("fullMoonEscape/toolRoom/timer/sec", timerObj.sec.toString().padStart(2, "0"));
    } else {
      client.publish("fullMoonEscape/toolRoom/timer/sec", timerObj.sec.toString());
    }
    if (timerObj.min.toString() < 10) {
      client.publish("fullMoonEscape/toolRoom/timer/min", timerObj.min.toString().padStart(2, "0"));
    } else {
      client.publish("fullMoonEscape/toolRoom/timer/min", timerObj.min.toString());
    }


    if (timerObj.min <= 0 && timerObj.sec === 0) {
      console.log("game is done")
      let complete = true;
      if (complete === true) {
        document.getElementById("game-status").style.backgroundColor = "red";
        document.getElementById("game-status").innerHTML = "Game Over!!!";
        stopCallback();
      }
    }
    if (timerObj.sec === 0) {
      timerObj.min = timerObj.min - 1;
      timerObj.sec = 60;
    }
    timerObj.sec = timerObj.sec - 1;
  }

  function stopCallback() {
    clearInterval(Timer)
  }



  function Clue() {
    clueNumber = clueNumber + 1;
    timerObj.min = timerObj.min - clueValue;
    if (timerObj.min < 0) {
      timerObj.sec = 0
    }
  }

  function redoClue() {
    clueNumber = clueNumber - 1;
    timerObj.min = timerObj.min + clueValue;
    if (timerObj.min < 0) {
      timerObj.sec = 0
    }
  }

  function addMin() {
    timerObj.min = timerObj.min + 1;
    if (timerObj.min < 0) {
      timerObj.sec = 0
    }
  }

  function subtractMin() {
    timerObj.min = timerObj.min - 1;
    if (timerObj.min < 0) {
      timerObj.sec = 0
    }
  }
  function addFiveMin() {
    timerObj.min = timerObj.min + 5;
    if (timerObj.min < 0) {
      timerObj.sec = 0
    }
  }

  function subtractFiveMin() {
    timerObj.min = timerObj.min - 5;
    if (timerObj.min < 0) {
      timerObj.sec = 0
    }
  }

  // allows user to reload program
  const reload = document.getElementById("restart")
  reload.addEventListener("click", restart);

  function restart() {
    let answer = window.confirm("Restart Application ?")
    if (answer) {
      window.location.reload()
    } else {
      return;
    }
  }

};




