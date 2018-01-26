function insertTitle() {

    var div = document.createElement('div');
    var floatingTitle = document.createElement('div')
        .innerText = config.title;
    div.className = "postitTitle";
    div.id = "idTitle";
    div.style.position = config.classOptions.position;
    div.style.background = config.classOptions.background;
    div.style.width = config.classOptions.width;
    div.style.zIndex = config.classOptions.zIndex;
    div.style.fontSize = config.classOptions.fontSize;
    div.style.border = config.classOptions.border;
    div.style.color = config.classOptions.color;
    div.style.top = "10px";
    div.style.left = "10px";
    div.style.lineHeight = "100%";

    div.append(floatingTitle);

    if (document.getElementById("idTitle") == null) {
        document.body.prepend(div);
    }
}

insertTitle();
