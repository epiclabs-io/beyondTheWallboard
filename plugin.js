var ReloadPlugin = function (settings) {
  var self = this;
  self.update(settings);
  self.isGoing = false;

  chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (t) {
      self.currentTab = t;
      if (self.isGoing) {
        self.startTimer(t.id);
      }
    });
  });
};

ReloadPlugin.prototype.getCustomSettings = function () {
  var self = this;
  chrome.storage.sync.get("customSettings", function (items) {
    self.customSettings = items[Object.keys(items)[0]];
  });
}

ReloadPlugin.prototype.update = function (settings) {
  var self = this;
  var customSettings = chrome.storage.sync.get("customSettings", function (items) {
    customSettings = items[Object.keys(items)[0]];
    self.timeDelay = customSettings.general.timeInterval || settings.seconds || 10;
    self.tabReload = settings.reload || true;
    self.tabInactive = settings.inactive || false;
    self.tabAutostart = customSettings.general.autoStart || settings.autostart || false;
    self.noRefreshList = settings.noRefreshList || [];
    self.reloadTabIds = settings.reloadTabIds || [];
  });
};

ReloadPlugin.prototype.updateTab = function (settings, tab) {
  var self = this;
  self.timeDelay = settings.tabs[tab.id].timeInterval;
}

ReloadPlugin.prototype.start = function () {
  var self = this;
  self.isGoing = true;
  self.getCustomSettings();
  self.getActiveTab(function (tab) {
    self.currentTab = tab;
    self.startTimer(tab.id);
  });
};

ReloadPlugin.prototype.stop = function () {
  var self = this;
  self.isGoing = false;
  clearTimeout(self.timer);
};

ReloadPlugin.prototype.startTimer = function () {
  var self = this;
  var tabSettings = self.getTabSettings(self.currentTab.id);
  var timeDelay = tabSettings.timeInterval || self.timeDelay;
  clearTimeout(self.timer);
  self.timer = setTimeout(function () {
    self.loadNextTab();
  }, timeDelay * 1000);
};

ReloadPlugin.prototype.getActiveTab = function (cb) {
  chrome.tabs.query({
    'active': true,
    'windowId': self.currentWindow
  }, function (tab) {
    cb(tab[0]);
  });
};

ReloadPlugin.prototype.loadNextTab = function () {
  var self = this;
  var ix = self.currentTab.index + 1;

  chrome.tabs.query({ windowId: self.currentWindow }, function (tabs) {
    if (ix >= tabs.length) {
      ix = 0;
    }

    var nextTab = tabs.filter(function (t) {
      return t.index === ix;
    });

    if (nextTab.length > 0) {
      self.activateTab(nextTab[0]);
      var tabSettings = self.getTabSettings(self.currentTab.id);
      if (tabSettings.refreshWhenLeave) {
      // if (self.shouldReloadTab(self.currentTab.id)) {
        chrome.tabs.onUpdated.addListener(function tabLoadComplete(tabId, info, t) {
          if (info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(tabLoadComplete);
            self.setTabActive(self.currentTab.id);
          }
        });
        chrome.tabs.reload(self.currentTab.id, {}, null);
      }
    }
  });
};

ReloadPlugin.prototype.getTabSettings = function (id) {
  var self = this;
  for (var i = 0; i < self.customSettings.tabs.length; i++) {
    if (self.customSettings.tabs[i].id == id) {
      return self.customSettings.tabs[i];
    }
  }
}

ReloadPlugin.prototype.shouldReloadTab = function (id) {
  var self = this;
  return (self.tabReload && self.reloadTabIds.length === 0)
    || (self.reloadTabIds.indexOf(id) > -1);
};

ReloadPlugin.prototype.setTabActive = function (tabId) {
  var self = this;
  chrome.tabs.update(tabId, { active: true }, function () {
    self.startTimer(tabId);
  });
}

ReloadPlugin.prototype.activateTab = function (tab) {
  var self = this;
  self.setTabActive(tab.id);
  setTabConfig(tab.id, tab.title);
};

ReloadPlugin.prototype.destroy = function () {
  self.timer = null;
};

function setTabConfig(id, title) {
  chrome.storage.sync.get(id + "", function (tab) {
    var postitTitle = tab[Object.keys(tab)[0]].postitTitle;
    var config = {
      title: postitTitle.customTitle || title,
      classOptions: {
        background: postitTitle.background || "rgba(0,0,0,0.8)",
        color: postitTitle.color || "white",
        width: postitTitle.width || "auto",
        border: postitTitle.border || "3px solid #73AD21",
        top: postitTitle.top || "10px",
        left: postitTitle.left || "10px",
        fontSize: postitTitle.fontSize || "30px",
      }
    };
  
    chrome.tabs.executeScript(id, {
      code: 'var config = ' + JSON.stringify(config)
    }, () => {
      chrome.tabs.executeScript(id, { file: 'content_script.js' }, (results) => {
        // nothing to do?
      });
    });
  
  });

  
}