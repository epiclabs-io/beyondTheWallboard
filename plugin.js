var ReloadPlugin = function (settings) {
  var self = this;
  self.isGoing = false;
  self.settings = settings;
};

ReloadPlugin.prototype.start = function (config) {
  var self = this;
  self.isGoing = true;
  self.settings = config;

  chrome.tabs.query({index: 0}, function (tab) {
    self.currentTab = tab[0];
    self.startTimer(tab[0].id);
  });
};

ReloadPlugin.prototype.stop = function () {
  var self = this;
  self.isGoing = false;
  clearTimeout(self.timer);
};

ReloadPlugin.prototype.startTimer = function (tabId) {
  var self = this;
  var tabSettings = self.settings.tabs.filter(tab => tab.id == tabId)[0];
  var timeDelay = tabSettings && tabSettings.timeInterval ? tabSettings.timeInterval : self.settings.general.timeInterval;
  clearTimeout(self.timer);
  self.timer = setTimeout(function () {
    self.loadNextTab();
  }, timeDelay * 1000);
};

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
    ReloadPlugin.startTimer();
  });

ReloadPlugin.prototype.getActiveTab = function (cb) {
  chrome.tabs.query({
    'active': true,
    'windowId': self.currentWindow
  }, function (tab) {
    console.log(tab);
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
      var tabIdToReload = self.currentTab.id;
      var tabSettings = self.settings.tabs.filter(tab => tab.id == self.currentTab.id)[0];
      self.activateTab(nextTab[0]);
      if (tabSettings && tabSettings.refreshWhenLeave || self.settings.refreshWhenLeave) {
        chrome.tabs.onUpdated.addListener(function tabLoadComplete(tabId, info, t) {
          if (info.status === "complete") {
            chrome.tabs.onUpdated.removeListener(tabLoadComplete);
            self.setTabActive(self.currentTab);
          }
        });
        chrome.tabs.reload(tabIdToReload, {}, null);
      }
    }
  });
};

function fillTabSettingsIfNotFound(tabSettings) {
  if (!tabSettings) {
    tabSettings = {};
    tabSettings.refreshWhenLeave = false;
    tabSettings.timeInterval = 10;
    return tabSettings;
  }
} 

ReloadPlugin.prototype.getTabSettings = function (id) {
  var self = this;
  for (var i = 0; i < self.settings.tabs.length; i++) {
    if (self.settings.tabs[i].id == id) {
      return self.settings.tabs[i];
    }
  }
}

ReloadPlugin.prototype.shouldReloadTab = function (id) {
  var self = this;
  return (self.tabReload && self.reloadTabIds.length === 0)
    || (self.reloadTabIds.indexOf(id) > -1);
};

ReloadPlugin.prototype.setTabActive = function (tab) {
  var self = this;
  self.currentTab = tab;
  chrome.tabs.update(tab.id, { active: true }, function () {
    self.startTimer(tab.id);
  });
}

ReloadPlugin.prototype.activateTab = function (tab) {
  var self = this;
  self.setTabActive(tab);
  setTabConfig(tab.id, tab.title, self.settings);
};

ReloadPlugin.prototype.destroy = function () {
  var self = this;
  self.timer = null;
};

function setTabConfig(id, title, settings) {
    var tab = settings.tabs.filter(tab => tab.id == id)[0];
    if (tab) {
      var postitTitle = tab.postitTitle;
      if (postitTitle) {
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
          });
        });
      }
    }
}
