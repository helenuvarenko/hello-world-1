// addEventListener polyfill 1.0 / Eirik Backer / MIT Licence
(function(win, doc){
  if(win.addEventListener)return;		//No need to polyfill

  function docHijack(p){var old = doc[p];doc[p] = function(v){return addListen(old(v))}}
  function addEvent(on, fn, self){
    return (self = this).attachEvent('on' + on, function(e){
      var e = e || win.event;
      e.preventDefault  = e.preventDefault  || function(){e.returnValue = false}
      e.stopPropagation = e.stopPropagation || function(){e.cancelBubble = true}
      fn.call(self, e);
    });
  }
  function addListen(obj, i){
    if(i = obj.length)while(i--)obj[i].addEventListener = addEvent;
    else obj.addEventListener = addEvent;
    return obj;
  }

  addListen([doc, win]);
  if('Element' in win)win.Element.prototype.addEventListener = addEvent;			//IE8
  else{																			//IE < 8
    doc.attachEvent('onreadystatechange', function(){addListen(doc.all)});		//Make sure we also init at domReady
    docHijack('getElementsByTagName');
    docHijack('getElementById');
    docHijack('createElement');
    addListen(doc.all);
  }
})(window, document);

(function (window, document) {
  if ((!window.addEventListener || !window.removeEventListener) && window.attachEvent && window.detachEvent) {
    /**
     * @type {Array}
     */
    var listeners = [];
    /**
     * @param {*} value
     * @return {boolean}
     */
    var is_callable = function (value) {
      return typeof value === 'function';
    };
    /**
     * @param {!Window|HTMLDocument|Node} self
     * @param {EventListener|function(!Event):(boolean|undefined)} listener
     * @return {!function(Event)|undefined}
     */
    var listeners_get = function (self, listener) {
      var lis;
      var i = listeners.length;
      while (i--) {
        lis = listeners[i];
        if (lis[0] === self && lis[1] === listener) {
          return lis[2];
        }
      }
    };
    /**
     * @param {!Window|HTMLDocument|Node} self
     * @param {EventListener|function(!Event):(boolean|undefined)} listener
     * @param {!function(Event)} callback
     * @return {!function(Event)}
     */
    var listeners_set = function (self, listener, callback) {
      return listeners_get(self, listener) || (listeners[listeners.length] = [
        self,
        listener,
        callback
      ], callback);
    };
    /**
     * @param {string} methodName
     */
    var docHijack = function (methodName) {
      var old = document[methodName];
      document[methodName] = function (v) {
        return addListen(old(v));
      };
    };
    /**
     * @this {!Window|HTMLDocument|Node}
     * @param {string} type
     * @param {EventListener|function(!Event):(boolean|undefined)} listener
     * @param {boolean=} useCapture
     */
    var addEvent = function (type, listener, useCapture) {
      if (is_callable(listener)) {
        var self = this;
        self.attachEvent(
          'on' + type,
          listeners_set(self, listener, function (e) {
            e = e || window.event;
            e.preventDefault = e.preventDefault || function () { e.returnValue = false };
            e.stopPropagation = e.stopPropagation || function () { e.cancelBubble = true };
            e.target = e.target || e.srcElement || document.documentElement;
            e.currentTarget = e.currentTarget || self;
            e.timeStamp = e.timeStamp || (new Date()).getTime();
            listener.call(self, e);
          })
        );
      }
    };
    /**
     * @this {!Window|HTMLDocument|Node}
     * @param {string} type
     * @param {EventListener|function(!Event):(boolean|undefined)} listener
     * @param {boolean=} useCapture
     */
    var removeEvent = function (type, listener, useCapture) {
      if (is_callable(listener)) {
        var self = this;
        var lis = listeners_get(self, listener);
        if (lis) {
          self.detachEvent('on' + type, lis);
        }
      }
    };
    /**
     * @param {!Node|NodeList|Array} obj
     * @return {!Node|NodeList|Array}
     */
    var addListen = function (obj) {
      var i = obj.length;
      if (i) {
        while (i--) {
          obj[i].addEventListener = addEvent;
          obj[i].removeEventListener = removeEvent;
        }
      } else {
        obj.addEventListener = addEvent;
        obj.removeEventListener = removeEvent;
      }
      return obj;
    };

    addListen([document, window]);
    if ('Element' in window) {
      /**
       * IE8
       */
      var element = window.Element;
      element.prototype.addEventListener = addEvent;
      element.prototype.removeEventListener = removeEvent;
    } else {
      /**
       * IE < 8
       */
      //Make sure we also init at domReady
      document.attachEvent('onreadystatechange', function () { addListen(document.all) });
      docHijack('getElementsByTagName');
      docHijack('getElementById');
      docHijack('createElement');
      addListen(document.all);
    }
  }
})(window, document);