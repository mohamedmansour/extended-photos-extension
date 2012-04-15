// ==UserScript==
// @name           Extended Photos for Google+
// @namespace      com.mohamedmansour.googleplus.extendedphotos
// @description    Adds HTML5 Fullscreen to Google+ Photos
// @version        1.0
// @include        https://plus.google.com/photos/*
// @include        https://plus.google.com/u/*/photos/*
// ==/UserScript==

(function() {
  var preserveStyle = null;

  // When fullscreen mode is toggled.
  var onFullscreen = function() {
    var zoomContainer = document.getElementById('crx-fullscreen');
    var photoContainer = document.querySelector('.photo-container');
    var photoParent = photoContainer.parentNode;
    var photoFrame = photoParent.parentNode;
    var isFullScreen = document.webkitIsFullScreen;
    if (isFullScreen) {
      zoomContainer.style.display = 'none';
      if (!preserveStyle) {
        preserveStyle = {
          top: photoFrame.style.top,
          bottom: photoFrame.style.bottom,
          left: photoFrame.style.left,
          right: photoFrame.style.right
        };
      }
    }
    else {
      zoomContainer.style.display = 'block';
    }
    photoFrame.style.top = isFullScreen ? 0 : preserveStyle.top;
    photoFrame.style.bottom = isFullScreen ? 0 : preserveStyle.bottom; 
    photoFrame.style.left =  isFullScreen ? 0 : preserveStyle.left;
    photoFrame.style.right =  isFullScreen ? 0 : preserveStyle.right;
    var resizeEvent = document.createEvent('Event');
    resizeEvent.initEvent('resizeEvent', true, true);
    window.dispatchEvent(resizeEvent);
  };
  
  var activateFullscreen = function() {
    event.preventDefault();
    var photoContainer = document.querySelector('.photo-container').parentNode.parentNode;
    photoContainer.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    return false;
  };
  
  // We need to somehow know when a photo appears. We can't use observers becuase
  // not all users have it.
  var renderFullScreen = function() {
    // There are usually two. The reason of having two is because it makes the user
    // experience better when you preload the next image. All the previous ones
    // are already in the cache and browsers are smart enough to know it.
    var photoContainer = document.querySelector('.photo-container');
    if (!photoContainer) {
      console.error('EXTENDED_SHARE', 'Photo Container not found!');
      return;
    }
    photoContainer.parentNode.parentNode.style.backgroundColor = '#0A0A0A';

    // Lets plagarize some components ... zing!
    var plusOneButton = document.querySelector('button[title$="this photo"]');
    var navigationContainer = plusOneButton.parentNode.parentNode.parentNode;
    var shareButton = navigationContainer.childNodes[0];

    var fullscreenButton = shareButton.cloneNode(true);
    fullscreenButton.id = 'crx-fullscreen';
    fullscreenButton.querySelector('span').innerText = 'Fullscreen';
    fullscreenButton.onclick = activateFullscreen;

    navigationContainer.insertBefore(fullscreenButton, shareButton);
  };
  
  // Listen on photobox creations.
  var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  var observer = new MutationObserver(function(mutations) {
    if (mutations.length === 1) {
      // Usually only a single node will get added to here.
      var addedNodes = mutations[0].addedNodes;
      if (addedNodes.length === 1) {
        // Discover if it is a photo box.
        var menuItems = addedNodes[0].querySelectorAll('div[role="menuitem"]');
        for (var m in menuItems) {
          var menuItem = menuItems[m];
          if (menuItem.nodeType === Node.ELEMENT_NODE && menuItem.innerText === 'Report photo') {
            setTimeout(renderFullScreen, 1000);
            return;
          }
        }
      }
    }
  });
  observer.observe(document.body, { childList: true });
  
  document.addEventListener('webkitfullscreenchange', onFullscreen, false);
  
  var resizeInject = function() {
    var resizeCallback = null;
    var resizeEvent = document.createEvent('Event');
    resizeEvent.initEvent('resizeEvent', true, true);
    var _addEventListener = window.addEventListener;
    window.addEventListener = function() {
      if (arguments[0] === 'resize') {
        resizeCallback = arguments[1];
      }
      _addEventListener.apply(window, arguments);
    };
    window.addEventListener('resizeEvent', function(e) {
      resizeCallback(e);
    });
  };
  var script = document.createElement('script');
  script.setAttribute('id', 'inject-area');
  script.appendChild(document.createTextNode('(' + resizeInject + ')();'));
  document.body.appendChild(script);
})();