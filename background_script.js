var settings = ['configLocalFilePath'];
var bg = chrome.extension.getBackgroundPage();

var instances = {};
var currentWindow = -2;
var globalConfig;

function getInstance(windowId) {
  return instances[windowId.toString()];
}

function activeWindowChange(id) {
  currentWindow = id;
  updateBadgeForInstance(getInstance(id));
}

function init(config) {
  globalConfig = config;

  chrome.windows.getAll(function (windows) {
    [].forEach.call(windows, function (win) {
      var p = instances[win.id.toString()] = new ReloadPlugin(config);
      p.currentWindow = win.id;

      if (win.focused) {
        activeWindowChange(win.id);
      }
    });
  });

  var badgeColor = [139, 137, 137, 137];
  chrome.browserAction.setBadgeBackgroundColor({
    color: badgeColor
  });
}

function updateBadgeForInstance(inst) {
  if (inst && inst.isGoing) {
    chrome.browserAction.setBadgeText({
      text: "\u2022"
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [0, 255, 0, 100]
    });
    chrome.browserAction.setTitle({
      title: 'Beyond The Wallboard - Enabled'
    });
  } else {
    chrome.browserAction.setBadgeText({
      text: "\u00D7"
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: [255, 0, 0, 100]
    });
    chrome.browserAction.setTitle({
      title: 'Beyond The Wallboard - Disabled'
    });
  }
}

function closeAllTabs(config) {
  chrome.tabs.query({}, function (tabs) {
    for (var i = 0; i < tabs.length; i++) {
      chrome.tabs.remove(tabs[i].id);
    }
    createWindow(config);
  });
}

function createWindow(config) {
  var urls = config.tabs.map(tab => tab.url);
  chrome.windows.create({
    url: urls,
    state: config.general.fullScreen ? 'fullscreen' : 'normal'
  }, function (win) {
    for (var i = 0; i < win.tabs.length; i++) {
      config.tabs[i].id = win.tabs[i].id;
    }
    initInstance(config);
  });
}

chrome.browserAction.onClicked.addListener(function () {
  chrome.windows.getCurrent({
    populate: true
  }, function (win) {
    var instance = getInstance(win.id);
    if (!instance || !instance.isGoing) {
      initBeyondTheWallboard();
    } else {
      instance.stop();
      updateBadgeForInstance(instance);
      instance = undefined;
    }
  });
});

chrome.windows.onFocusChanged.addListener(activeWindowChange);


function initBeyondTheWallboard() {
  chrome.storage.sync.get('settings', (settings) => {
    closeAllTabs(settings.settings);
  });
}

function initInstance(config) {
  chrome.windows.getCurrent({
    populate: true
  }, function (win) {
    var i = instances[win.id.toString()] = new ReloadPlugin(config);
    i.currentWindow = win.id;
    var instance = getInstance(win.id);
    instance.start(config);
    updateBadgeForInstance(instance);
  });
}