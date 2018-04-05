var bg = chrome.extension.getBackgroundPage();
var status = document.getElementById('status');

function save_options() {
  var configLocalFilePath = document.getElementById('configLocalFilePath').value;
  console.log(configLocalFilePath);

  status.innerHTML = 'Saving Options';

  settings = {
    'configLocalFilePath': configLocalFilePath,
  };

  chrome.windows.getCurrent(function (win) {
    var inst = bg.getInstance(win.id);
    inst.update(settings);
  });

  chrome.storage.sync.set(settings);
  setTimeout(function () {
    status.innerHTML = '';
  }, 3000);
}

[].forEach.call(document.querySelectorAll('.save-btn'), function (btn) {
  btn.addEventListener('click', save_options);
});

function onConfigLocalFilePathChange(event) {
  const files = event.target.files;

  if (!files || !files[0] || files[0].type !== 'application/json') {
    return;
  }

  const reader = new FileReader();
  reader.onload = (function (event) {
    chrome.storage.sync.set(event.target.result);
  });
  reader.readAsText(files[0]);
}

document.getElementById('configLocalFilePath').addEventListener('change', onConfigLocalFilePathChange, false);
