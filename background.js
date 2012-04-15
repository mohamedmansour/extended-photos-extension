/**
 * @author Mohamed Mansour 2012 (http://mohamedmansour.com)
 */
 
settings = {
  get version() {
    return localStorage['version'];
  },
  set version(val) {
    settings.notify('version', val);
    localStorage['version'] = val;
  },
  get opt_out() {
    var key = localStorage['opt_out'];
    return (typeof key == 'undefined') ? false : key === 'true';
  },
  set opt_out(val) {
    settings.notify('opt_out', val);
    localStorage['opt_out'] = val;
  }
};

// Settings event listeners.
settings.listeners = {};
settings.notify = function(key, val) {
  var listeners = settings.listeners[key]
  if (listeners) {
    listeners.forEach(function(callback, index) {
      callback(key, val);
    });
  }
};
settings.addListener = function(key, callback) {
  if (!settings.listeners[key]) {
    settings.listeners[key] = [];
  }
  settings.listeners[key].push(callback);
};

VersionManager = function() {
  this.currVersion = null;
  this.prevVersion = null;
};

/**
 * Triggered when the extension just loaded. Should be the first thing
 * that happens when chrome loads the extension.
 */
VersionManager.prototype.init = function() {
  this.currVersion = chrome.app.getDetails().version;
  this.prevVersion = settings.version;
  if (this.currVersion != this.prevVersion) {
    // Check if we just installed this extension.
    if (typeof this.prevVersion == 'undefined') {
      this.onInstall();
    } else {
      this.onUpdate(this.prevVersion, this.currVersion);
    }
    settings.version = this.currVersion;
  }
};

/**
 * Triggered when the extension just installed.
 */
VersionManager.prototype.onInstall = function() {
  chrome.tabs.create({url: 'about.html'});
};

/**
 * Triggered when the extension just uploaded to a new version. DB Migrations
 * notifications, etc should go here.
 *
 * @param {string} previous The previous version.
 * @param {string} current  The new version updating to.
 */
VersionManager.prototype.onUpdate = function(previous, current) {
};

var versionManager = new VersionManager();
versionManager.init();

