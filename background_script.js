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
  chrome.windows.create({url: urls}, function (win) {
    for (var i=0; i< win.tabs.length; i++) {
      config.tabs[i].id = win.tabs[i].id;
    }
      initInstance(config);
  });
}

chrome.browserAction.onClicked.addListener(function () {
  initBeyondTheWallboard();
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
    updateBadgeForInstance(instance);
    instance.start(config);
  });
}

function openTabs(config, getWindowAndInit) {
  var tabs = getTabURLsFromJSON(config);
  var count = tabs.length;
  for (var i = 0; i < tabs.length; i++) {
    chrome.tabs.create({
      url: tabs[i]
    }, function (tab) {
      config.tabs[i-1].id = tab.id;
      count--;
      if (count == 0) {
        getWindowAndInit();
      }
    });
  }
}

function getTabURLsFromJSON(config) {
  var tabURLs = config.tabs.map(function (tab) {
    return tab.url;
  });
  return tabURLs;
}