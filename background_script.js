var settings = ['seconds',
  'reload',
  'inactive',
  'autostart',
  'noRefreshList',
  'reloadTabIds'
];
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

function loadJSON(path, success, error) {
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        if (success)
          success(JSON.parse(xhr.responseText));
      } else {
        if (error)
          error(xhr);
      }
    }
  };
  xhr.open("GET", path, true);
  xhr.send();
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
  chrome.browserAction.setBadgeBackgroundColor({ color: badgeColor });
}

function updateBadgeForInstance(inst) {
  if (inst && inst.isGoing) {
    chrome.browserAction.setBadgeText({ text: "\u2022" });
    chrome.browserAction.setBadgeBackgroundColor({ color: [0, 255, 0, 100] });
    chrome.browserAction.setTitle({ title: 'Beyond The Wallboard - Enabled' });
  }
  else {
    chrome.browserAction.setBadgeText({ text: "\u00D7" });
    chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 100] });
    chrome.browserAction.setTitle({ title: 'Beyond The Wallboard - Disabled' });
  }
}

chrome.storage.sync.get(settings, init);
chrome.browserAction.onClicked.addListener(function () {
  chrome.windows.getCurrent(function (win) {
    var instance = getInstance(win.id);
    initBeyondTheWallboard();
  });
});

chrome.windows.onFocusChanged.addListener(activeWindowChange);
chrome.windows.onCreated.addListener(function (win) {
  var i = instances[win.id.toString()] = new ReloadPlugin(globalConfig);
  i.currentWindow = win.id;
});
chrome.windows.onRemoved.addListener(function (id) {
  instances[id.toString()].destroy();
  delete instances[id.toString()];
});

function initBeyondTheWallboard() {
  loadJSON('config.json',
    function (data) {
      config = data;
      openTabs(config);
      chrome.windows.getCurrent(function (win) {
        storeGeneralConfig(config);
        addTabIDsToConfig(config, function () {
          var instance = getInstance(win.id);
          updateBadgeForInstance(instance);
          instance.start();
        });
      });
    },
    function (xhr) {
      console.error(xhr);
    }
  );
}

function openTabs(config) {
  var tabs = getTabURLsFromJSON(config);
  chrome.windows.create({ url: tabs });
}

function getTabURLsFromJSON(config) {
  var tabURLs = config.tabs.map(function (tab) {
    return tab.url;
  });
  return tabURLs;
}

function addTabIDsToConfig(config, callback) {
  chrome.tabs.query({
    currentWindow: true
  }, function (tabs) {
    for (var i = 0; i < config.tabs.length; i++) {
      var id = tabs[i].id;
      config.tabs[i].id = id;
      storeTabConfig(config, id + "", i);
    }
    callback();
  });
}

function storeGeneralConfig(config) {
  chrome.storage.sync.set({ "general": config.general });
}

function storeTabConfig(config, id, i) {
  chrome.storage.sync.set({ [id]: config.tabs[i] });
}
