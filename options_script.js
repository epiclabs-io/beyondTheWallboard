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

    updateChromeStorageSettings(newSettings);
  } else {
    document.getElementById('status').innerHTML = 'No options provided or invalid config file';
  }
}

function updateChromeStorageSettings(newSettings) {
  chrome.storage.sync.set({
    settings: newSettings
  }, function () {
    updateCurrentSettings();
    setTimeout(function () {
      document.getElementById('status').innerHTML = '';
    }, 2000);
  });
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

function loadExternalOptions() {
  var configExternalUrl = document.getElementById('externalJsonUrl').value;
  var reloadTime = document.getElementById('reloadTime').value;

  var xhr = new XMLHttpRequest();
  xhr.open("GET", configExternalUrl, true);
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4) {
      // JSON.parse does not evaluate the attacker's scripts.
      var resp = JSON.parse(xhr.responseText);
      resp.configExternalUrl = configExternalUrl;
      console.log(resp);
      updateChromeStorageSettings(resp);
      sendInitTimerToLoadExternalConfigEvent(reloadTime);
    }
  }
  xhr.send();

}

function sendInitTimerToLoadExternalConfigEvent(reloadTime) {
  if (!isNaN(reloadTime)) {
    chrome.runtime.sendMessage({configReloadTime: reloadTime});
  }
}

document.getElementById('configLocalFilePath').addEventListener('change', onConfigLocalFilePathChange, false);

[].forEach.call(document.querySelectorAll('.save-btn'), function (btn) {
  btn.addEventListener('click', saveOptions);
});

[].forEach.call(document.querySelectorAll('.load-ext-btn'), function (btn) {
  btn.addEventListener('click', loadExternalOptions);
});

document.addEventListener('DOMContentLoaded', function () {
  updateCurrentSettings();
  document.getElementById('local-settings').style.visibility = 'hidden';
  document.getElementById('external-settings').style.visibility = 'hidden';
});

document.getElementById('localOrExternalForm').addEventListener('click', showOrHideLocalOrExternal);

function showOrHideLocalOrExternal() {
  if (document.getElementsByName('radioButton')[0].checked) {
    document.getElementById('local-settings').style.visibility = 'visible';
    document.getElementById('external-settings').style.visibility = 'hidden';
  } else if (document.getElementsByName('radioButton')[1].checked) {
    document.getElementById('local-settings').style.visibility = 'hidden';
    document.getElementById('external-settings').style.visibility = 'visible';
  }
}