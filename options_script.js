var bg = chrome.extension.getBackgroundPage();
var newSettings = undefined;

function updateCurrentSettings() {
  chrome.storage.sync.get('settings', function (result) {
    if (Object.keys(result).length == 0) {
      document.getElementById('current-settings-placeholder').innerHTML = 'No config available. Please load some configuration file.'
    } else {
        document.getElementById('current-settings-placeholder').innerHTML = JSON.stringify(result, null, 2);
    }
  });
}

function saveOptions() {
  var configLocalFilePath = document.getElementById('configLocalFilePath').value;

  if (newSettings !== undefined) {
    document.getElementById('status').innerHTML = 'Saving options';

    chrome.storage.sync.set({ settings: newSettings }, function () {
      updateCurrentSettings();
      setTimeout(function () {
        document.getElementById('status').innerHTML = '';
      }, 2000);
    });
  } else {
    document.getElementById('status').innerHTML = 'No options provided or invalid config file';
  }
}

function onConfigLocalFilePathChange(event) {
  const files = event.target.files;

  if (!files || !files[0] || files[0].type !== 'application/json') {
    return;
  }

  const reader = new FileReader();
  reader.onload = (function (event) {
    newSettings = JSON.parse(event.target.result);
  });
  reader.readAsText(files[0]);
}

document.getElementById('configLocalFilePath').addEventListener('change', onConfigLocalFilePathChange, false);

[].forEach.call(document.querySelectorAll('.save-btn'), function (btn) {
  btn.addEventListener('click', saveOptions);
});

document.addEventListener('DOMContentLoaded', function () {
  updateCurrentSettings();
});