function insertTitle() {

    var div = document.createElement('div');
    var floatingTitle = document.createElement('div')
        .innerText = config.title;

    div.className = "postitTitle";
    div.id = "idTitle";
    div.style.position = 'fixed';
    div.style.zIndex = 9999;
    div.style.lineHeight = '100%';
    div.style.padding = '8px';
    div.style.textAlign = 'center';
    div.style.fontSize = config.classOptions.fontSize;
    div.style.background = config.classOptions.background;
    div.style.width = config.classOptions.width;
    div.style.border = config.classOptions.border;
    div.style.color = config.classOptions.color;
    div.style.top = config.classOptions.top;
    div.style.left = config.classOptions.left;
    

    div.append(floatingTitle);

    if (document.getElementById("idTitle") == null) {
        document.body.prepend(div);
    }
}

insertTitle();

function addListen(){
   document.body.addEventListener("keyup", RenewTimeoutTime);
   document.body.addEventListener("scroll", RenewTimeoutTime);
   document.body.addEventListener("mousemove", RenewTimeoutTime);
}

document.addEventListener('DOMContentLoaded', addListen, false);  //this is the important bit

function RenewTimeoutTime(){
   var pageName = window.location.href;
   var currentTime = new Date();
   var time = currentTime.getTime();    //i replaced the time just to be neat
   localStorage.setItem("inTimeout", false);
   localStorage.setItem("AI_Timeout_Time", time + 270000);
   console.log(localStorage.getItem("AI_Timeout_Time"));
   chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
}