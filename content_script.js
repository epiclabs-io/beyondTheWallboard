function insertTitle() {
    if (typeof config !== 'undefined') {
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
}

insertTitle();

document.onmousedown = RenewTimeoutTime;
document.onmousemove = RenewTimeoutTime;
document.onkeydown = RenewTimeoutTime;
document.onscroll = RenewTimeoutTime;

function RenewTimeoutTime(){
   chrome.runtime.sendMessage({eventCaptured: true});
}