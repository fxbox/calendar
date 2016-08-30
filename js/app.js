define(['components/react', 'components/react-dom', 'components/moment', 'components/lodash', 'components/cldr/en', 'components/cldr/core', 'components/webaudiokws', 'components/chrono'], function (React, ReactDOM, moment, _, components_cldr_en, components_cldr_core, PocketSphinx, chrono) { 'use strict';

  React = 'default' in React ? React['default'] : React;
  ReactDOM = 'default' in ReactDOM ? ReactDOM['default'] : ReactDOM;
  moment = 'default' in moment ? moment['default'] : moment;
  _ = 'default' in _ ? _['default'] : _;
  PocketSphinx = 'default' in PocketSphinx ? PocketSphinx['default'] : PocketSphinx;
  chrono = 'default' in chrono ? chrono['default'] : chrono;

  var jsx = function () {
    var REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
    return function createRawReactElement(type, props, key, children) {
      var defaultProps = type && type.defaultProps;
      var childrenLength = arguments.length - 3;

      if (!props && childrenLength !== 0) {
        props = {};
      }

      if (props && defaultProps) {
        for (var propName in defaultProps) {
          if (props[propName] === void 0) {
            props[propName] = defaultProps[propName];
          }
        }
      } else if (!props) {
        props = defaultProps || {};
      }

      if (childrenLength === 1) {
        props.children = children;
      } else if (childrenLength > 1) {
        var childArray = Array(childrenLength);

        for (var i = 0; i < childrenLength; i++) {
          childArray[i] = arguments[i + 3];
        }

        props.children = childArray;
      }

      return {
        $$typeof: REACT_ELEMENT_TYPE,
        type: type,
        key: key === undefined ? null : '' + key,
        ref: null,
        props: props,
        _owner: null
      };
    };
  }();

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  /*
   * This file provides an helper to add custom events to any object.
   *
   * In order to use this functionality with any object consumer should extend
   * target object class with EventDispatcher:
   *
   * class Obj extends EventDispatcher {}
   * const obj = new Obj();
   *
   * A list of events can be optionally provided and it is recommended to do so.
   * If a list is provided then only the events present in the list will be
   * allowed. Using events not present in the list will cause other functions to
   * throw an error:
   *
   * class Obj extends EventDispatcher {
   *   constructor() {
   *     super(['somethinghappened', 'somethingelsehappened']);
   *   }
   * }
   * const obj = new Obj();
   *
   * The object will have five new methods: 'on', 'once', 'off', 'offAll' and
   * 'emit'. Use 'on' to register a new event-handler:
   *
   * obj.on("somethinghappened", function onSomethingHappened() { ... });
   *
   * If the same event-handler is added multiple times then only one will be
   * registered, e.g.:
   *
   * function onSomethingHappened() { ... }
   * obj.on("somethinghappened", onSomethingHappened);
   * obj.on("somethinghappened", onSomethingHappened); // Does nothing
   *
   * Use 'off' to remove a registered listener:
   *
   * obj.off("somethinghappened", onSomethingHappened);
   *
   * Use 'once' to register a one-time event-handler: it will be automatically
   * unregistered after being called.
   *
   * obj.once("somethinghappened", function onSomethingHappened() { ... });
   *
   * And use 'offAll' to remove all registered event listeners for the specified
   * event:
   *
   * obj.offAll("somethinghappened");
   *
   * When used without parameters 'offAll' removes all registered event handlers,
   * this can be useful when writing unit-tests.
   *
   * Finally use 'emit' to send an event to the registered handlers:
   *
   * obj.emit("somethinghappened");
   *
   * An optional parameter can be passed to 'emit' to be passed to the registered
   * handlers:
   *
   * obj.emit("somethinghappened", 123);
   */

  var assertValidEventName = function (eventName) {
    if (!eventName || typeof eventName !== 'string') {
      throw new Error('Event name should be a valid non-empty string!');
    }
  };

  var assertValidHandler = function (handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler should be a function!');
    }
  };

  var assertAllowedEventName = function (allowedEvents, eventName) {
    if (allowedEvents && allowedEvents.indexOf(eventName) < 0) {
      throw new Error(`Event "${ eventName }" is not allowed!`);
    }
  };

  var p$1 = Object.freeze({
    allowedEvents: Symbol('allowedEvents'),
    listeners: Symbol('listeners')
  });

  var EventDispatcher = function () {
    function EventDispatcher(allowedEvents) {
      classCallCheck(this, EventDispatcher);

      if (typeof allowedEvents !== 'undefined' && !Array.isArray(allowedEvents)) {
        throw new Error('Allowed events should be a valid array of strings!');
      }

      this[p$1.listeners] = new Map();
      this[p$1.allowedEvents] = allowedEvents;
    }

    /**
     * Registers listener function to be executed once event occurs.
     *
     * @param {string} eventName Name of the event to listen for.
     * @param {function} handler Handler to be executed once event occurs.
     */


    EventDispatcher.prototype.on = function on(eventName, handler) {
      assertValidEventName(eventName);
      assertAllowedEventName(this[p$1.allowedEvents], eventName);
      assertValidHandler(handler);

      var handlers = this[p$1.listeners].get(eventName);
      if (!handlers) {
        handlers = new Set();
        this[p$1.listeners].set(eventName, handlers);
      }

      // Set.add ignores handler if it has been already registered.
      handlers.add(handler);
    };

    /**
     * Registers listener function to be executed only first time when event
     * occurs.
     *
     * @param {string} eventName Name of the event to listen for.
     * @param {function} handler Handler to be executed once event occurs.
     */


    EventDispatcher.prototype.once = function once(eventName, handler) {
      var _this = this;

      assertValidHandler(handler);

      var once = function (parameters) {
        _this.off(eventName, once);

        handler.call(_this, parameters);
      };

      this.on(eventName, once);
    };

    /**
     * Removes registered listener for the specified event.
     *
     * @param {string} eventName Name of the event to remove listener for.
     * @param {function} handler Handler to remove, so it won't be executed
     * next time event occurs.
     */


    EventDispatcher.prototype.off = function off(eventName, handler) {
      assertValidEventName(eventName);
      assertAllowedEventName(this[p$1.allowedEvents], eventName);
      assertValidHandler(handler);

      var handlers = this[p$1.listeners].get(eventName);
      if (!handlers) {
        return;
      }

      handlers.delete(handler);

      if (!handlers.size) {
        this[p$1.listeners].delete(eventName);
      }
    };

    /**
     * Removes all registered listeners for the specified event.
     *
     * @param {string=} eventName Name of the event to remove all listeners for.
     */


    EventDispatcher.prototype.offAll = function offAll(eventName) {
      if (typeof eventName === 'undefined') {
        this[p$1.listeners].clear();
        return;
      }

      assertValidEventName(eventName);
      assertAllowedEventName(this[p$1.allowedEvents], eventName);

      var handlers = this[p$1.listeners].get(eventName);
      if (!handlers) {
        return;
      }

      handlers.clear();

      this[p$1.listeners].delete(eventName);
    };

    /**
     * Emits specified event so that all registered handlers will be called
     * with the specified parameters.
     *
     * @param {string} eventName Name of the event to call handlers for.
     * @param {Object=} parameters Optional parameters that will be passed to
     * every registered handler.
     */


    EventDispatcher.prototype.emit = function emit(eventName, parameters) {
      var _this2 = this;

      assertValidEventName(eventName);
      assertAllowedEventName(this[p$1.allowedEvents], eventName);

      var handlers = this[p$1.listeners].get(eventName);
      if (!handlers) {
        return;
      }

      handlers.forEach(function (handler) {
        try {
          handler.call(_this2, parameters);
        } catch (error) {
          console.error(error);
        }
      });
    };

    /**
     * Checks if there are any listeners that listen for the specified event.
     *
     * @param {string} eventName Name of the event to check listeners for.
     * @returns {boolean}
     */


    EventDispatcher.prototype.hasListeners = function hasListeners(eventName) {
      assertValidEventName(eventName);
      assertAllowedEventName(this[p$1.allowedEvents], eventName);

      return this[p$1.listeners].has(eventName);
    };

    return EventDispatcher;
  }();

  // Prefix all entries to avoid collisions.
  var PREFIX = 'cue-';

  var ORIGIN = 'https://calendar.knilxof.org';

  /**
   * API version to use (currently not configurable).
   * @type {number}
   * @const
   */
  var API_VERSION = 1;

  /**
   * Regex to match upper case literals.
   * @type {RegExp}
   * @const
   */
  var UPPER_CASE_REGEX = /([A-Z])/g;

  var p = Object.freeze({
    values: Symbol('values'),
    storage: Symbol('storage'),

    // Private methods.
    updateSetting: Symbol('updateSetting'),
    stringToSettingTypedValue: Symbol('stringToSettingTypedValue'),
    getDefaultSettingValue: Symbol('getDefaultSettingValue'),
    onStorage: Symbol('onStorage')
  });

  // Definition of all available settings and their default values (if needed).
  var settings = Object.freeze({
    // String settings.
    SESSION: Object.freeze({ key: 'session' }),
    IS_HUB: Object.freeze({ key: 'isHub', type: 'boolean' }),
    GA_CLIENT_ID: Object.freeze({ key: 'gaClientID' })
  });

  var Settings = function (_EventDispatcher) {
    inherits(Settings, _EventDispatcher);

    function Settings() {
      var storage = arguments.length <= 0 || arguments[0] === undefined ? localStorage : arguments[0];
      classCallCheck(this, Settings);

      // Not all browsers have localStorage supported or activated.
      var _this = possibleConstructorReturn(this, _EventDispatcher.call(this));

      _this[p.storage] = storage || {
        getItem: function () {
          return null;
        },
        setItem: function () {},
        removeItem: function () {},
        clear: function () {}
      };

      _this[p.values] = new Map();

      Object.keys(settings).forEach(function (settingName) {
        var setting = settings[settingName];
        var settingStringValue = _this[p.storage].getItem(`${ PREFIX }${ setting.key }`);

        // Setting values directly to avoid firing events on startup.
        _this[p.values].set(setting, _this[p.stringToSettingTypedValue](setting, settingStringValue));
      });

      window.addEventListener('storage', _this[p.onStorage].bind(_this));

      Object.seal(_this);
      return _this;
    }

    /**
     * Iterates through all known settings and sets default value for all of them.
     *
     * @return {Promise}
     */
    Settings.prototype.clear = function clear() {
      var _this2 = this;

      return new Promise(function (resolve) {
        Object.keys(settings).forEach(function (settingName) {
          var setting = settings[settingName];
          _this2[p.updateSetting](setting, _this2[p.getDefaultSettingValue](setting));
        });
        resolve();
      });
    };

    /**
     * Tries to update setting with new value. If value has changed corresponding
     * event will be emitted. New value is also persisted to the local storage.
     *
     * @param {Object} setting Setting description object.
     * @param {number|boolean|string?} newValue New value for specified setting.
     * @private
     */


    Settings.prototype[p.updateSetting] = function (setting, newValue) {
      var currentValue = this[p.values].get(setting);
      if (currentValue === newValue) {
        return;
      }

      this[p.values].set(setting, newValue);

      if (newValue !== this[p.getDefaultSettingValue](setting)) {
        this[p.storage].setItem(`${ PREFIX }${ setting.key }`, newValue);
      } else {
        this[p.storage].removeItem(`${ PREFIX }${ setting.key }`);
      }

      this.emit(setting.key.replace(UPPER_CASE_REGEX, function (part) {
        return `-${ part.toLowerCase() }`;
      }), newValue);
    };

    /**
     * Converts setting raw string value to the typed one depending on the setting
     * type.
     *
     * @param {Object} setting Setting description object.
     * @param {string?} stringValue Raw string setting value or null.
     * @return {number|boolean|string|null}
     * @private
     */


    Settings.prototype[p.stringToSettingTypedValue] = function (setting, stringValue) {
      // If string is null, we should return default value for this setting or
      // default value for setting type.
      if (stringValue === null) {
        return this[p.getDefaultSettingValue](setting);
      } else if (setting.type === 'boolean') {
        return stringValue === 'true';
      } else if (setting.type === 'number') {
        return Number(stringValue);
      }

      return stringValue;
    };

    /**
     * Gets default typed value for the specified setting.
     *
     * @param {Object} setting Setting description object.
     * @return {number|boolean|string|null}
     * @private
     */


    Settings.prototype[p.getDefaultSettingValue] = function (setting) {
      if (setting.defaultValue !== undefined) {
        return setting.defaultValue;
      }

      // Default value for this setting is not specified, let's return default
      // value for setting type (boolean, number or string).
      if (setting.type === 'boolean') {
        return false;
      } else if (setting.type === 'number') {
        return 0;
      }

      return null;
    };

    /**
     * Handles localStorage "storage" event.
     *
     * @param {StorageEvent} evt StorageEvent instance.
     * @private
     */


    Settings.prototype[p.onStorage] = function (evt) {
      if (!evt.key.startsWith(PREFIX)) {
        return;
      }

      var key = evt.key.substring(PREFIX.length);
      var settingName = Object.keys(settings).find(function (settingName) {
        return settings[settingName].key === key;
      });

      if (!settingName) {
        console.warn(`Changed unknown storage entry with app specific prefix: ${ evt.key }`);
        return;
      }

      var setting = settings[settingName];

      this[p.updateSetting](setting, this[p.stringToSettingTypedValue](setting, evt.newValue));
    };

    createClass(Settings, [{
      key: 'session',
      get: function () {
        return this[p.values].get(settings.SESSION);
      },
      set: function (value) {
        this[p.updateSetting](settings.SESSION, value);
      }
    }, {
      key: 'isHub',
      get: function () {
        return this[p.values].get(settings.IS_HUB);
      },
      set: function (value) {
        this[p.updateSetting](settings.IS_HUB, value);
      }
    }, {
      key: 'gaClientID',
      get: function () {
        return this[p.values].get(settings.GA_CLIENT_ID);
      },
      set: function (value) {
        this[p.updateSetting](settings.GA_CLIENT_ID, value);
      }

      // Getters only.

    }, {
      key: 'origin',
      get: function () {
        return ORIGIN;
      }
    }, {
      key: 'apiVersion',
      get: function () {
        return API_VERSION;
      }
    }]);
    return Settings;
  }(EventDispatcher);

  var BaseController = function () {
    function BaseController(properties) {
      classCallCheck(this, BaseController);

      Object.assign(this, properties || {});
    }

    BaseController.prototype.main = function main() {
      throw new Error('Not implemented!');
    };

    return BaseController;
  }();

  var Analytics = function (_BaseController) {
    inherits(Analytics, _BaseController);

    function Analytics(props) {
      classCallCheck(this, Analytics);

      // Creates an initial ga() function.
      // The queued commands will be executed once analytics.js loads.
      var _this = possibleConstructorReturn(this, _BaseController.call(this, props));

      window.ga = window.ga || function () {
        (ga.q = ga.q || []).push(arguments);
      };

      // Sets the time (as an integer) this tag was executed.
      // Used for timing hits.
      ga.l = Date.now();

      // Creates a default tracker.
      ga('create', 'UA-83150540-1', {
        'siteSpeedSampleRate': 100,
        'forceSSL': true,
        'dataSource': 'app', // Rather than web.
        'appName': 'Project Cue',

        // Disabling cookies.
        // @see https://developers.google.com/analytics/devguides/collection/
        //    analyticsjs/cookies-user-id#disabling_cookies
        'storage': 'none',
        'clientId': _this.settings.gaClientID
      });

      // Using localStorage to store the client ID.
      // @see https://developers.google.com/analytics/devguides/collection/
      //    analyticsjs/cookies-user-id#using_localstorage_to_store_the_client_id
      ga(function (tracker) {
        _this.settings.gaClientID = tracker.get('clientId');
      });

      // Sends a pageview hit from the tracker just created.
      ga('send', 'pageview');

      // Track the installation of the app using the W3C app manifest.
      window.addEventListener('install', function () {
        ga('send', 'event', 'App', 'install');
      });
      return _this;
    }

    return Analytics;
  }(BaseController);

  var UserLogin = function (_React$Component) {
    inherits(UserLogin, _React$Component);

    function UserLogin(props) {
      classCallCheck(this, UserLogin);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        login: 'mozilla'
      };

      _this.server = props.server;

      _this.onChange = _this.onChange.bind(_this);
      _this.onFormSubmit = _this.onFormSubmit.bind(_this);
      return _this;
    }

    UserLogin.prototype.onChange = function onChange(evt) {
      var login = evt.target.value;
      this.setState({ login });
    };

    UserLogin.prototype.onFormSubmit = function onFormSubmit(evt) {
      evt.preventDefault(); // Avoid redirection to /?.

      this.server.login(this.state.login, 'password').then(function () {
        location.hash = 'reminders';
      });
    };

    UserLogin.prototype.render = function render() {
      return jsx('form', {
        className: 'user-login',
        onSubmit: this.onFormSubmit
      }, void 0, jsx('input', {
        value: this.state.login,
        placeholder: 'Family name',
        className: 'user-login__name-field',
        onChange: this.onChange
      }), jsx('button', {
        className: 'user-login__login-button'
      }, void 0, jsx('img', {
        src: 'css/icons/next.svg'
      })));
    };

    return UserLogin;
  }(React.Component);

  var ALLOWED_ACTIONS = ['login', 'logout'];
  var DEFAULT_ACTION = ALLOWED_ACTIONS[0];

  var UsersController = function (_BaseController) {
    inherits(UsersController, _BaseController);

    function UsersController() {
      classCallCheck(this, UsersController);
      return possibleConstructorReturn(this, _BaseController.apply(this, arguments));
    }

    UsersController.prototype.main = function main() {
      var action = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_ACTION : arguments[0];

      if (!ALLOWED_ACTIONS.includes(action)) {
        console.error(`Bad users route: "${ action }". Falling back to ${ DEFAULT_ACTION }.`);
        action = DEFAULT_ACTION;
      }

      switch (action) {
        case 'login':
          this.login();
          break;

        case 'logout':
          this.logout();
          break;
      }
    };

    UsersController.prototype.login = function login() {
      ReactDOM.render(React.createElement(UserLogin, { server: this.server }), this.mountNode);
    };

    UsersController.prototype.logout = function logout() {
      this.server.logout().then(function () {
        // Once logged out, we redirect to the login page.
        location.hash = 'users/login';
      });
    };

    return UsersController;
  }(BaseController);

  var TYPES = ['success', 'info', 'warning', 'danger'];

  var Toaster = function (_React$Component) {
    inherits(Toaster, _React$Component);

    function Toaster(props) {
      classCallCheck(this, Toaster);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        display: false,
        message: '',
        type: 'success'
      };

      _this.duration = 6000;
      _this.timeout = null;
      _this.hide = _this.hide.bind(_this);
      return _this;
    }

    Toaster.prototype.success = function success(message) {
      this.setState({ type: 'success' });
      this.show(message);
    };

    Toaster.prototype.info = function info(message) {
      this.setState({ type: 'info' });
      this.show(message);
    };

    Toaster.prototype.warning = function warning(message) {
      this.setState({ type: 'warning' });
      this.show(message);
    };

    Toaster.prototype.danger = function danger(message) {
      this.setState({ type: 'danger' });
      this.show(message);
    };

    Toaster.prototype.show = function show() {
      var message = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      clearTimeout(this.timeout);
      this.setState({ display: true, message });
      this.timeout = setTimeout(this.hide, this.duration);
    };

    Toaster.prototype.hide = function hide() {
      this.setState({ display: false });
    };

    Toaster.prototype.validateType = function validateType(candidate) {
      if (!TYPES.includes(candidate)) {
        return TYPES[0];
      }
      return candidate;
    };

    Toaster.prototype.render = function render() {
      var className = `toaster ${ this.validateType(this.state.type) }`;
      var transform = this.state.display ? 'translateY(0)' : 'translateY(-100%)';
      return jsx('div', {
        className: className,
        style: { transform }
      }, void 0, jsx('p', {}, void 0, this.state.message));
    };

    return Toaster;
  }(React.Component);

  var Microphone = function (_React$Component) {
    inherits(Microphone, _React$Component);

    function Microphone(props) {
      classCallCheck(this, Microphone);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        isListeningToSpeech: false
      };

      _this.speechController = props.speechController;
      _this.server = props.server;

      _this.audioCtx = new window.AudioContext();
      _this.audioBuffer = null;
      _this.bufferSource = null;
      _this.timeout = null;

      _this.startListeningToSpeech = _this.startListeningToSpeech.bind(_this);
      _this.stopListeningToSpeech = _this.stopListeningToSpeech.bind(_this);
      _this.onClickMic = _this.onClickMic.bind(_this);
      return _this;
    }

    Microphone.prototype.componentDidMount = function componentDidMount() {
      this.loadAudio();

      //this.speechController.on('wakeheard', this.startListeningToSpeech);
      this.speechController.on('speechrecognitionstop', this.stopListeningToSpeech);
    };

    Microphone.prototype.componentWillUnmount = function componentWillUnmount() {
      //this.speechController.off('wakeheard', this.startListeningToSpeech);
      this.speechController.off('speechrecognitionstop', this.stopListeningToSpeech);
    };

    Microphone.prototype.loadAudio = function loadAudio() {
      var _this2 = this;

      fetch('media/cue.wav').then(function (res) {
        if (!res.ok) {
          throw new Error(res.status);
        }

        return res.arrayBuffer();
      }).then(function (arrayBuffer) {
        _this2.audioCtx.decodeAudioData(arrayBuffer, function (buffer) {
          _this2.audioBuffer = buffer;
        }, function (err) {
          console.error('The audio buffer could not be decoded.', err);
        });
      });
    };

    Microphone.prototype.playBleep = function playBleep() {
      if (!this.audioBuffer) {
        return;
      }

      this.bufferSource = this.audioCtx.createBufferSource();
      this.bufferSource.buffer = this.audioBuffer;
      this.bufferSource.connect(this.audioCtx.destination);
      this.bufferSource.start(0);
    };

    Microphone.prototype.stopBleep = function stopBleep() {
      if (!this.bufferSource) {
        return;
      }

      this.bufferSource.stop(0);
      this.bufferSource = null;
    };

    Microphone.prototype.startListeningToSpeech = function startListeningToSpeech() {
      this.playBleep();
      this.setState({ isListeningToSpeech: true });
    };

    Microphone.prototype.stopListeningToSpeech = function stopListeningToSpeech() {
      this.stopBleep();
      this.setState({ isListeningToSpeech: false });
    };

    Microphone.prototype.onClickMic = function onClickMic() {
      var _this3 = this;

      if (!this.state.isListeningToSpeech) {
        this.playBleep();
        this.setState({ isListeningToSpeech: true });
        this.timeout = setTimeout(function () {
          // When the sound finished playing
          _this3.stopBleep();
          _this3.speechController.startSpeechRecognition();
        }, 1000);
        return;
      }

      clearTimeout(this.timeout);
      this.stopBleep();
      this.setState({ isListeningToSpeech: false });
      this.speechController.stopSpeechRecognition();
    };

    Microphone.prototype.render = function render() {
      if (!this.server.isLoggedIn) {
        return null;
      }

      var className = this.state.isListeningToSpeech ? 'listening' : '';

      return jsx('div', {
        className: className,
        onClick: this.onClickMic
      }, void 0, jsx('div', {
        className: 'microphone__background'
      }), jsx('img', {
        className: 'microphone__icon',
        src: 'css/icons/microphone.svg'
      }));
    };

    return Microphone;
  }(React.Component);

  var COLOURS = ['red', 'salmon', 'goldenrod', 'orange', 'green', 'cyan', 'blue', 'violet', 'slategrey', 'grey'];

  var ReminderItem = function (_React$Component) {
    inherits(ReminderItem, _React$Component);

    function ReminderItem(props) {
      classCallCheck(this, ReminderItem);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      TwitterCldr.set_data(TwitterCldrDataBundle);

      _this.listFormatter = new TwitterCldr.ListFormatter();
      _this.reminder = props.reminder;
      _this.onDelete = props.onDelete;
      _this.onEdit = props.onEdit;
      return _this;
    }

    ReminderItem.prototype.getColour = function getColour() {
      var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      var hash = function (string) {
        var hash = 0,
            i = void 0,
            chr = void 0,
            len = void 0;
        if (string.length === 0) {
          return 0;
        }
        for (i = 0, len = string.length; i < len; i++) {
          chr = string.charCodeAt(i);
          hash = (hash << 5) - hash + chr;
          hash |= 0; // Convert to 32bit integer
        }
        return hash;
      };

      return COLOURS[hash(name) % COLOURS.length];
    };

    ReminderItem.prototype.render = function render() {
      var reminder = this.reminder;
      var recipients = this.listFormatter.format(reminder.recipients);
      var contentClassName = ['reminders__item-content', this.getColour(recipients)].join(' ');

      return jsx('li', {
        className: 'reminders__item'
      }, void 0, jsx('div', {
        className: 'reminders__item-time'
      }, void 0, jsx('div', {}, void 0, moment(reminder.due).format('LT'))), jsx('div', {
        className: contentClassName
      }, void 0, jsx('h3', {
        className: 'reminders__item-recipient'
      }, void 0, recipients), jsx('p', {
        className: 'reminders__item-text'
      }, void 0, reminder.action, jsx('button', {
        className: 'reminders__button reminders__edit',
        onClick: this.onEdit
      }, void 0, 'Edit'), jsx('button', {
        className: 'reminders__button reminders__delete',
        onClick: this.onDelete
      }, void 0, 'Delete'))));
    };

    return ReminderItem;
  }(React.Component);

  var EditDialog = function (_React$Component) {
    inherits(EditDialog, _React$Component);

    function EditDialog(props) {
      classCallCheck(this, EditDialog);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        display: false,
        id: null,
        recipients: null,
        action: null,
        due: null
      };

      _this.server = props.server;
      _this.refreshReminders = props.refreshReminders;

      _this.dueDateInput = null;
      _this.dueTimeInput = null;

      _this.onKeyPress = _this.onKeyPress.bind(_this);
      _this.onChangeAction = _this.onChangeAction.bind(_this);
      _this.onChangeDue = _this.onChangeDue.bind(_this);
      _this.onSave = _this.onSave.bind(_this);
      _this.onClose = _this.onClose.bind(_this);
      return _this;
    }

    EditDialog.prototype.componentDidMount = function componentDidMount() {
      window.document.addEventListener('keydown', this.onKeyPress);
    };

    /**
     * Circumvent a bug in Chrome for Android (tested in v.52 and v.53) where the
     * date and time inputs value are not populated via the `value` attribute and
     * must be set using the `value` property.
     */


    EditDialog.prototype.componentDidUpdate = function componentDidUpdate() {
      if (!this.dueDateInput || !this.dueTimeInput) {
        return;
      }

      var due = this.state.due;
      var date = moment(due).format('YYYY-MM-DD');
      var time = moment(due).format('HH:mm');

      this.dueDateInput.value = date;
      this.dueTimeInput.value = time;
    };

    EditDialog.prototype.componentWillUnmount = function componentWillUnmount() {
      window.document.removeEventListener('keydown', this.onKeyPress);
    };

    EditDialog.prototype.onKeyPress = function onKeyPress(evt) {
      var display = this.state.display;

      if (!display) {
        return;
      }

      var key = evt.key;
      if (key === 'Escape') {
        this.hide();
      }
    };

    EditDialog.prototype.onChangeAction = function onChangeAction(evt) {
      var action = evt.target.value.trim();

      if (action) {
        this.setState({ action });
      }
    };

    EditDialog.prototype.onChangeDue = function onChangeDue() {
      var date = this.dueDateInput.value.split('-');
      var time = this.dueTimeInput.value.split(':');

      try {
        var dueMoment = moment().year(date[0]).month(date[1] - 1).date(date[2]).hour(time[0]).minute(time[1]);

        var due = Number(dueMoment.toDate());
        this.setState({ due });
      } catch (err) {
        console.error('Could not parse the input due date and time.');
      }
    };

    EditDialog.prototype.onSave = function onSave() {
      var _this2 = this;

      var reminder = {
        id: this.state.id,
        recipients: this.state.recipients,
        action: this.state.action,
        due: this.state.due
      };
      this.server.reminders.update(reminder).then(function () {
        _this2.refreshReminders();
        _this2.hide();
      }).catch(function (err) {
        console.error(err);
        _this2.hide();
        alert('The reminder could not be updated. Try again later.');
      });
    };

    EditDialog.prototype.onClose = function onClose() {
      this.hide();
    };

    EditDialog.prototype.show = function show() {
      var reminder = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

      this.setState({
        display: true,
        id: reminder.id,
        recipients: reminder.recipients,
        action: reminder.action,
        due: reminder.due
      });
    };

    EditDialog.prototype.hide = function hide() {
      this.setState({ display: false });
    };

    EditDialog.prototype.render = function render() {
      var _this3 = this;

      if (!this.state.display) {
        return null;
      }

      return jsx('div', {}, void 0, jsx('div', {
        className: 'dialog-overlay',
        onClick: this.onClose
      }), jsx('div', {
        className: 'dialog'
      }, void 0, jsx('div', {
        className: 'dialog-title'
      }, void 0, jsx('h3', {}, void 0, 'Edit reminder'), jsx('span', {
        className: 'dialog-title__close',
        onClick: this.onClose
      }, void 0, 'Close')), jsx('div', {
        className: 'dialog-content'
      }, void 0, jsx('div', {
        className: 'dialog-content__section'
      }, void 0, jsx('h4', {}, void 0, 'Recipients'), jsx('input', {
        className: 'dialog-content__input',
        value: this.state.recipients,
        disabled: true
      })), jsx('div', {
        className: 'dialog-content__section'
      }, void 0, jsx('h4', {}, void 0, 'Action'), jsx('textarea', {
        className: 'dialog-content__input',
        value: this.state.action,
        onChange: this.onChangeAction
      })), jsx('div', {
        className: 'dialog-content__section'
      }, void 0, jsx('h4', {}, void 0, 'Due time'), React.createElement('input', { className: 'dialog-content__input dialog-content__half',
        type: 'date',
        placeholder: 'YYYY-MM-DD',
        onChange: this.onChangeDue,
        ref: function (t) {
          return _this3.dueDateInput = t;
        } }), React.createElement('input', { className: 'dialog-content__input dialog-content__half',
        type: 'time',
        placeholder: 'HH:mm',
        onChange: this.onChangeDue,
        ref: function (t) {
          return _this3.dueTimeInput = t;
        } }))), jsx('div', {
        className: 'dialog-buttons'
      }, void 0, jsx('button', {
        className: 'dialog-buttons__save',
        onClick: this.onSave
      }, void 0, 'Save'), jsx('button', {
        className: 'dialog-buttons__cancel',
        onClick: this.onClose
      }, void 0, 'Cancel'))));
    };

    return EditDialog;
  }(React.Component);

  var RemindersList = function (_React$Component) {
    inherits(RemindersList, _React$Component);

    function RemindersList(props) {
      classCallCheck(this, RemindersList);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        reminders: props.reminders
      };

      _this.server = props.server;
      _this.refreshReminders = props.refreshReminders;

      _this.editDialog = null;
      return _this;
    }

    RemindersList.prototype.componentWillReceiveProps = function componentWillReceiveProps(props) {
      this.setState({ reminders: props.reminders });
    };

    RemindersList.prototype.onEdit = function onEdit(id) {
      var reminder = this.state.reminders.find(function (reminder) {
        return reminder.id === id;
      });
      this.editDialog.show(reminder);
    };

    RemindersList.prototype.onDelete = function onDelete(id) {
      var _this2 = this;

      // @todo Nice to have: optimistic update.
      // https://github.com/fxbox/calendar/issues/32
      this.server.reminders.delete(id).then(function () {
        var reminders = _this2.state.reminders.filter(function (reminder) {
          return reminder.id !== id;
        });
        _this2.setState({ reminders });
      }).catch(function () {
        console.error(`The reminder ${ id } could not be deleted.`);
      });
    };

    RemindersList.prototype.render = function render() {
      var _this3 = this;

      var reminders = this.state.reminders;

      // Sort all the reminders chronologically.
      reminders = reminders.sort(function (a, b) {
        return a.due - b.due;
      });

      // Group the reminders by month.
      reminders = _.groupBy(reminders, function (reminder) {
        return moment(reminder.due).format('YYYY/MM');
      });

      // For each month, group the reminders by day.
      Object.keys(reminders).forEach(function (month) {
        reminders[month] = _.groupBy(reminders[month], function (reminder) {
          return moment(reminder.due).format('YYYY/MM/DD');
        });
      });

      var remindersNode = Object.keys(reminders).map(function (key) {
        var month = moment(key, 'YYYY/MM').format('MMMM');
        var reminderMonth = reminders[key];

        return jsx('div', {}, key, jsx('h2', {
          className: 'reminders__month'
        }, void 0, month), Object.keys(reminderMonth).map(function (key) {
          var date = moment(key, 'YYYY/MM/DD');
          var remindersDay = reminderMonth[key];

          return jsx('div', {
            className: 'reminders__day'
          }, key, jsx('div', {
            className: 'reminders__day-date'
          }, void 0, jsx('div', {
            className: 'reminders__day-mday'
          }, void 0, date.format('DD')), jsx('div', {
            className: 'reminders__day-wday'
          }, void 0, date.format('ddd'))), jsx('ol', {
            className: 'reminders__list'
          }, void 0, remindersDay.map(function (reminder) {
            return jsx(ReminderItem, {
              reminder: reminder,
              onDelete: _this3.onDelete.bind(_this3, reminder.id),
              onEdit: _this3.onEdit.bind(_this3, reminder.id)
            }, reminder.id);
          })));
        }));
      });

      return jsx('div', {}, void 0, remindersNode, React.createElement(EditDialog, { server: this.server,
        refreshReminders: this.refreshReminders,
        ref: function (t) {
          return _this3.editDialog = t;
        } }));
    };

    return RemindersList;
  }(React.Component);

  var Reminders = function (_React$Component) {
    inherits(Reminders, _React$Component);

    function Reminders(props) {
      classCallCheck(this, Reminders);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        reminders: []
      };

      _this.speechController = props.speechController;
      _this.server = props.server;

      _this.refreshInterval = null;
      _this.toaster = null;
      _this.microphone = null;
      _this.debugEvent = _this.debugEvent.bind(_this);
      _this.onWakeWord = _this.onWakeWord.bind(_this);
      _this.onReminder = _this.onReminder.bind(_this);
      _this.onParsingFailure = _this.onParsingFailure.bind(_this);
      _this.onWebPushMessage = _this.onWebPushMessage.bind(_this);
      _this.refreshReminders = _this.refreshReminders.bind(_this);
      _this.addReminder = _this.addReminder.bind(_this);

      moment.locale(navigator.languages || navigator.language || 'en-US');
      return _this;
    }

    Reminders.prototype.componentDidMount = function componentDidMount() {
      var _this2 = this;

      this.refreshReminders().then(function () {
        console.log('Reminders loaded');
      });

      // Refresh the page every 5 minutes if idle.
      this.refreshInterval = setInterval(function () {
        if (_this2.speechController.idle) {
          location.reload(true);
        }
      }, 5 * 60 * 1000);

      this.speechController.on('wakelistenstart', this.debugEvent);
      this.speechController.on('wakelistenstop', this.debugEvent);
      this.speechController.on('wakeheard', this.debugEvent);
      this.speechController.on('speechrecognitionstart', this.debugEvent);
      this.speechController.on('speechrecognitionstop', this.debugEvent);
      this.speechController.on('reminder', this.debugEvent);

      this.speechController.on('wakeheard', this.onWakeWord);
      this.speechController.on('reminder', this.onReminder);
      this.speechController.on('parsing-failed', this.onParsingFailure);
      this.server.on('push-message', this.onWebPushMessage);
    };

    Reminders.prototype.componentWillUnmount = function componentWillUnmount() {
      clearInterval(this.refreshInterval);

      this.speechController.off('wakelistenstart', this.debugEvent);
      this.speechController.off('wakelistenstop', this.debugEvent);
      this.speechController.off('wakeheard', this.debugEvent);
      this.speechController.off('speechrecognitionstart', this.debugEvent);
      this.speechController.off('speechrecognitionstop', this.debugEvent);
      this.speechController.off('reminder', this.debugEvent);

      this.speechController.off('wakeheard', this.onWakeWord);
      this.speechController.off('reminder', this.onReminder);
      this.speechController.off('parsing-failed', this.onParsingFailure);
      this.server.off('push-message', this.onWebPushMessage);
    };

    Reminders.prototype.debugEvent = function debugEvent(evt) {
      if (evt.result !== undefined) {
        console.log(evt.type, evt.result);
        return;
      }

      console.log(evt.type);
    };

    Reminders.prototype.refreshReminders = function refreshReminders() {
      var _this3 = this;

      // @todo Add a loader.
      return this.server.reminders.getAll().then(function (reminders) {
        _this3.setState({ reminders });
      });
    };

    Reminders.prototype.addReminder = function addReminder(reminder) {
      var reminders = this.state.reminders;
      reminders.push(reminder);

      this.setState({ reminders });
    };

    Reminders.prototype.onWakeWord = function onWakeWord() {
      this.microphone.startListeningToSpeech();
    };

    Reminders.prototype.onReminder = function onReminder(evt) {
      var _this4 = this;

      var _evt$result = evt.result;
      var recipients = _evt$result.recipients;
      var action = _evt$result.action;
      var due = _evt$result.due;
      var confirmation = _evt$result.confirmation;


      this.microphone.stopListeningToSpeech();

      // @todo Nice to have: optimistic update.
      // https://github.com/fxbox/calendar/issues/32
      this.server.reminders.set({
        recipients,
        action,
        due
      }).then(function (reminder) {
        _this4.addReminder(reminder);

        _this4.toaster.success(confirmation);
        _this4.speechController.speak(confirmation).then(function () {
          console.log('Utterance terminated.');
          _this4.toaster.hide();
          _this4.speechController.startListeningForWakeword();
        });
      }).catch(function (res) {
        console.error('Saving the reminder failed.', res);
        var message = 'This reminder could not be saved. ' + 'Please try again later.';
        _this4.toaster.warning(message);
        _this4.speechController.speak(message).then(function () {
          _this4.toaster.hide();
          _this4.speechController.startListeningForWakeword();
        });
      });
    };

    Reminders.prototype.onParsingFailure = function onParsingFailure() {
      var _this5 = this;

      this.microphone.stopListeningToSpeech();

      var message = 'I did not understand that. Can you repeat?';
      this.toaster.warning(message);
      this.speechController.speak(message).then(function () {
        console.log('Utterance terminated.');
        _this5.toaster.hide();
        _this5.speechController.startListeningForWakeword();
      });
    };

    Reminders.prototype.onWebPushMessage = function onWebPushMessage(message) {
      var id = message.fullMessage.id;

      // We don't want to delete them, merely remove it from our local state.
      // At reload, we shouldn't get it because their status changed server-side
      // too.
      var reminders = this.state.reminders.filter(function (reminder) {
        return reminder.id !== id;
      });
      this.setState({ reminders });
    };

    // @todo Add a different view when there's no reminders:
    // https://github.com/fxbox/calendar/issues/16


    Reminders.prototype.render = function render() {
      var _this6 = this;

      return jsx('section', {
        className: 'reminders'
      }, void 0, React.createElement(Toaster, { ref: function (t) {
          return _this6.toaster = t;
        } }), jsx('div', {
        className: 'microphone'
      }, void 0, React.createElement(Microphone, { ref: function (t) {
          return _this6.microphone = t;
        },
        speechController: this.speechController,
        server: this.server })), jsx(RemindersList, {
        reminders: this.state.reminders,
        server: this.server,
        refreshReminders: this.refreshReminders
      }));
    };

    return Reminders;
  }(React.Component);

  var FullScreen = function (_React$Component) {
    inherits(FullScreen, _React$Component);

    function FullScreen(props) {
      classCallCheck(this, FullScreen);

      var _this = possibleConstructorReturn(this, _React$Component.call(this, props));

      _this.state = {
        isFullScreen: false
      };

      _this.fullScreenEnabled = document.fullscreenEnabled || document.mozFullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled;

      _this.onFullScreenChange = _this.onFullScreenChange.bind(_this);
      _this.onFullScreen = _this.onFullScreen.bind(_this);
      return _this;
    }

    FullScreen.prototype.componentDidMount = function componentDidMount() {
      var _this2 = this;

      ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'].forEach(function (type) {
        document.addEventListener(type, _this2.onFullScreenChange);
      });
    };

    FullScreen.prototype.componentWillUnmount = function componentWillUnmount() {
      var _this3 = this;

      ['fullscreenchange', 'mozfullscreenchange', 'webkitfullscreenchange', 'MSFullscreenChange'].forEach(function (type) {
        document.removeEventListener(type, _this3.onFullScreenChange);
      });
    };

    FullScreen.prototype.onFullScreenChange = function onFullScreenChange() {
      var isFullScreen = !!(document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement);

      this.setState({ isFullScreen });

      if (!isFullScreen) {
        return;
      }

      // If we're in fullscreen mode, let's try to lock the orientation.
      if (screen && 'orientation' in screen && 'lock' in screen.orientation) {
        screen.orientation.lock('landscape').catch(function () {
          // Don't panic. We're probably just on desktop.
        });
      }
    };

    FullScreen.prototype.onFullScreen = function onFullScreen() {
      if (this.state.isFullScreen) {
        return;
      }

      var target = document.body;

      if (target.requestFullscreen) {
        target.requestFullscreen();
      } else if (target.msRequestFullscreen) {
        target.msRequestFullscreen();
      } else if (target.mozRequestFullScreen) {
        target.mozRequestFullScreen();
      } else if (target.mozRequestFullscreen) {
        target.mozRequestFullscreen();
      } else if (target.webkitRequestFullscreen) {
        target.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    };

    FullScreen.prototype.render = function render() {
      if (!this.fullScreenEnabled || this.state.isFullScreen) {
        return null;
      }

      return jsx('button', {
        className: 'full-screen__button',
        onClick: this.onFullScreen
      }, void 0, 'Full screen');
    };

    return FullScreen;
  }(React.Component);

  var RemindersController = function (_BaseController) {
    inherits(RemindersController, _BaseController);

    function RemindersController() {
      classCallCheck(this, RemindersController);
      return possibleConstructorReturn(this, _BaseController.apply(this, arguments));
    }

    RemindersController.prototype.main = function main() {
      ReactDOM.render(React.createElement(Reminders, {
        speechController: this.speechController,
        server: this.server
      }), this.mountNode);

      ReactDOM.render(React.createElement(FullScreen), document.querySelector('.full-screen'));
    };

    return RemindersController;
  }(BaseController);

  var WakeWordRecogniser = function () {
    function WakeWordRecogniser() {
      var _this = this;

      classCallCheck(this, WakeWordRecogniser);

      this.audioContext = new AudioContext();

      this.audioSource = navigator.mediaDevices.getUserMedia({
        audio: true
      }).then(function (stream) {
        return _this.audioContext.createMediaStreamSource(stream);
      }).catch(function (error) {
        console.error(`Could not getUserMedia: ${ error }`);
        throw error;
      });

      this.recogniser = new PocketSphinx(this.audioContext, {
        pocketSphinxUrl: 'pocketsphinx.js',
        workerUrl: 'js/components/ps-worker.js',
        args: [['-kws_threshold', '2']]
      });

      var dictionary = {
        'MAKE': ['M EY K'],
        'A': ['AH'],
        'NOTE': ['N OW T']
      };

      var keywordReady = this.recogniser.addDictionary(dictionary).then(function () {
        return _this.recogniser.addKeyword('MAKE A NOTE');
      });

      this.ready = Promise.all([keywordReady, this.audioSource]);
      Object.seal(this);
    }

    WakeWordRecogniser.prototype.startListening = function startListening() {
      var _this2 = this;

      return this.ready.then(function () {
        return _this2.audioSource;
      }).then(function (source) {
        source.connect(_this2.recogniser);
        _this2.recogniser.connect(_this2.audioContext.destination);
        return;
      });
    };

    WakeWordRecogniser.prototype.stopListening = function stopListening() {
      var _this3 = this;

      return this.ready.then(function () {
        return _this3.audioSource;
      }).then(function (source) {
        source.disconnect();
        _this3.recogniser.disconnect();
      });
    };

    WakeWordRecogniser.prototype.setOnKeywordSpottedCallback = function setOnKeywordSpottedCallback(fn) {
      this.recogniser.on('keywordspotted', fn);
    };

    return WakeWordRecogniser;
  }();

  var p$4 = Object.freeze({
    isListening: Symbol('isListening'),
    recognition: Symbol('recognition'),
    supportsRecognition: Symbol('supportsRecognition')
  });

  var SpeechRecogniser = function () {
    function SpeechRecogniser() {
      classCallCheck(this, SpeechRecogniser);

      this[p$4.isListening] = false;

      var Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      var supportsRecognition = !!Recognition;

      this[p$4.supportsRecognition] = supportsRecognition;

      if (supportsRecognition) {
        this[p$4.recognition] = new Recognition();
        // Continuous mode prevents Android from being stuck for 5 seconds between
        // the last word said and the results to come in.
        this[p$4.recognition].continuous = true;
      } else {
        this[p$4.recognition] = null;
      }

      Object.seal(this);
    }

    SpeechRecogniser.prototype.listenForUtterance = function listenForUtterance() {
      var _this = this;

      if (!this[p$4.supportsRecognition]) {
        return Promise.reject(new Error('Speech recognition not supported in this browser'));
      }

      if (this[p$4.isListening]) {
        return Promise.reject(new Error('Speech recognition is already listening'));
      }

      return new Promise(function (resolve, reject) {
        _this[p$4.isListening] = true;

        // Not using `addEventListener` here to avoid
        // `removeEventListener` everytime it's simpler
        // to just redefine `onresult` to the same effect.
        _this[p$4.recognition].onresult = function (event) {
          // Due to continuous mode, many results may arrive. We choose to only
          // return the first result and to forget about the following ones.
          if (_this[p$4.isListening]) {
            _this[p$4.recognition].stop();
            _this[p$4.isListening] = false;

            // Always take first result
            var result = event.results[0][0];

            return resolve({
              confidence: result.confidence,
              utterance: result.transcript
            });
          }
        };

        _this[p$4.recognition].onerror = function (error) {
          _this[p$4.recognition].stop();
          _this[p$4.isListening] = false;
          return reject(error);
        };

        _this[p$4.recognition].start();
      });
    };

    SpeechRecogniser.prototype.abort = function abort() {
      // @xxx abort() should be used, but throws an error that puts the app in an
      // unusable state. In more details, when we used it, we kept getting a
      // SpeechRecognitionError with the code "network" (and no extra information)
      // Our investigation showed that network or the server side is not to blame
      // but it's a border effect of using webkitSpeechRecognition and
      // JsSpeechRecognizer at the same time.
      // Using stop() sends data to STT servers but we will get errors like
      // SpeechRecognitionError (code "no-speech") or if something was heard, the
      // pattern won't be matched.
      this[p$4.recognition].stop();
      this[p$4.isListening] = false;

      return Promise.resolve();
    };

    return SpeechRecogniser;
  }();

  var p$5 = Object.freeze({
    // Properties
    synthesis: Symbol('synthesis'),
    supportsSynthesis: Symbol('supportsSynthesis'),
    preferredVoice: Symbol('preferredVoice'),
    initialised: Symbol('initialised'),

    // Methods
    setPreferredVoice: Symbol('setPreferredVoice')
  });

  var VOICE_PITCH = 0.8;
  var VOICE_RATE = 0.9;

  var SpeechSynthesis = function () {
    function SpeechSynthesis() {
      classCallCheck(this, SpeechSynthesis);

      var synthesis = window.speechSynthesis;

      this[p$5.initialised] = false;
      this[p$5.supportsSynthesis] = !!synthesis;
      this[p$5.preferredVoice] = null;

      if (this[p$5.supportsSynthesis]) {
        this[p$5.synthesis] = synthesis;
        this[p$5.setPreferredVoice]();
        this[p$5.synthesis].onvoiceschanged = this[p$5.setPreferredVoice].bind(this);
      } else {
        this[p$5.synthesis] = null;
      }

      Object.seal(this);
    }

    /**
     * Speak a text aloud.
     *
     * @param {string} text
     * @return {Promise} A promise that resolves when the utterance is finished.
     */


    SpeechSynthesis.prototype.speak = function speak() {
      var _this = this;

      var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return new Promise(function (resolve, reject) {
        if (!text) {
          return resolve();
        }

        var utterance = new SpeechSynthesisUtterance(text);

        if (_this[p$5.preferredVoice]) {
          // Use a preferred voice if available.
          utterance.voice = _this[p$5.preferredVoice];
        }
        utterance.lang = 'en-GB';
        utterance.pitch = VOICE_PITCH;
        utterance.rate = VOICE_RATE;
        utterance.onend = function () {
          resolve();
        };
        utterance.onerror = function () {
          reject();
        };

        _this[p$5.synthesis].speak(utterance);
      });
    };

    /**
     * From all the voices available, set the default language to English with a
     * female voice if available.
     */


    SpeechSynthesis.prototype[p$5.setPreferredVoice] = function () {
      if (this[p$5.initialised]) {
        return;
      }

      var voices = this[p$5.synthesis].getVoices();

      if (!voices.length) {
        return;
      }

      var englishVoices = voices.filter(function (voice) {
        return voice.lang === 'en' || voice.lang.startsWith('en-') || voice.lang.startsWith('en_');
      });

      var femaleVoices = englishVoices.filter(function (voice) {
        return voice.name.includes('Female');
      });

      if (femaleVoices.length) {
        this[p$5.preferredVoice] = femaleVoices[0];
      } else if (englishVoices.length) {
        this[p$5.preferredVoice] = englishVoices[0];
      }

      this[p$5.initialised] = true;
      this[p$5.synthesis].onvoiceschanged = null;
    };

    return SpeechSynthesis;
  }();

  /*
   * @todo:
   *   * @see http://www.unicode.org/cldr/charts/29/verify/dates/en.html
   *     for formatting the time of the day.
   */

  var p$8 = Object.freeze({
    // Properties
    listFormatter: Symbol('listFormatter'),

    // Methods
    getLocalised: Symbol('getLocalised'),
    formatUser: Symbol('formatUser'),
    formatAction: Symbol('formatAction'),
    formatTime: Symbol('formatTime'),
    isToday: Symbol('isToday'),
    isTomorrow: Symbol('isTomorrow'),
    isThisMonth: Symbol('isThisMonth'),
    formatHoursAndMinutes: Symbol('formatHoursAndMinutes')
  });

  var DEFAULT_LOCALE = 'en';
  var PATTERNS$1 = {
    en: {
      template: `OK, I'll remind [users] [action] [time].`,
      formatUser: function (user) {
        return user.replace(/\bme\b/gi, 'you').replace(/\bI'm\b/gi, 'you\'re').replace(/\bI've\b/gi, 'you\'ve').replace(/\bI'll\b/gi, 'you\'ll').replace(/\bI\b/gi, 'you').replace(/\bmy\b/gi, 'your').replace(/\bmine\b/gi, 'yours');
      }
    },
    fr: {
      template: `OK, je rappelerai [users] [action] [time].`,
      formatUser: function (user) {
        return user;
      }
    },
    ja: {
      template: `承知しました。[time][users]に[action]をリマインドします。`,
      formatUser: function (user) {
        return user;
      }
    }
  };

  var Confirmation = function () {
    function Confirmation() {
      var locale = arguments.length <= 0 || arguments[0] === undefined ? DEFAULT_LOCALE : arguments[0];
      classCallCheck(this, Confirmation);

      this.locale = locale;

      TwitterCldr.set_data(TwitterCldrDataBundle);

      this[p$8.listFormatter] = new TwitterCldr.ListFormatter();
    }

    /**
     * Generate a phrase to be spoken to confirm a reminder.
     *
     * @param {Object} reminder
     * @return {string}
     */


    Confirmation.prototype.getReminderMessage = function getReminderMessage(reminder) {
      var template = this[p$8.getLocalised]('template');
      var data = {
        users: this[p$8.formatUser](reminder),
        action: this[p$8.formatAction](reminder),
        time: this[p$8.formatTime](reminder)
      };

      return template.replace(/\[([^\]]+)\]/g, function (match, placeholder) {
        return data[placeholder];
      });
    };

    /**
     * Given a property of the PATTERNS object, returns the one matching the
     * current locale or the default one if non existing.
     *
     * @param {string} prop
     * @returns {*}
     */


    Confirmation.prototype[p$8.getLocalised] = function (prop) {
      var locale = this.locale;
      if (!PATTERNS$1[this.locale] || !PATTERNS$1[this.locale][prop]) {
        locale = DEFAULT_LOCALE;
      }

      return PATTERNS$1[locale][prop];
    };

    Confirmation.prototype[p$8.formatUser] = function (reminder) {
      var recipients = reminder.recipients;

      var formatUser = this[p$8.getLocalised]('formatUser');
      var formattedRecipients = recipients.map(formatUser);
      return this[p$8.listFormatter].format(formattedRecipients);
    };

    Confirmation.prototype[p$8.formatAction] = function (reminder) {
      var action = reminder.action;

      var formatUser = this[p$8.getLocalised]('formatUser');
      var formattedAction = formatUser(action);
      var PATTERN1 = new RegExp(`\\bthat \\[action\\]`, 'iu');
      var PATTERN2 = new RegExp(`\\bit is \\[action\\]`, 'iu');
      var PATTERN3 = new RegExp(`\\babout \\[action\\]`, 'iu');

      if (PATTERN1.test(reminder.match)) {
        return `that ${ formattedAction }`;
      } else if (PATTERN2.test(reminder.match)) {
        return `that it is ${ formattedAction }`;
      } else if (PATTERN3.test(reminder.match)) {
        return `about ${ formattedAction }`;
      }

      return `to ${ formattedAction }`;
    };

    Confirmation.prototype[p$8.formatTime] = function (reminder) {
      var due = reminder.due;


      if (this[p$8.isToday](due)) {
        var hour = this[p$8.formatHoursAndMinutes](due);
        return `at ${ hour } today`;
      } else if (this[p$8.isTomorrow](due)) {
        var _hour = this[p$8.formatHoursAndMinutes](due);
        return `at ${ _hour } tomorrow`;
      } else if (this[p$8.isThisMonth](due)) {
        return moment(due).format('[on the] Do');
      }

      return moment(due).format('[on] MMMM [the] Do');
    };

    Confirmation.prototype[p$8.isToday] = function (date) {
      var today = moment().startOf('day');
      var tomorrow = moment().add(1, 'day').startOf('day');
      return moment(date).isBetween(today, tomorrow);
    };

    Confirmation.prototype[p$8.isTomorrow] = function (date) {
      var tomorrow = moment().add(1, 'day').startOf('day');
      var in2days = moment().add(2, 'day').startOf('day');
      return moment(date).isBetween(tomorrow, in2days);
    };

    Confirmation.prototype[p$8.isThisMonth] = function (date) {
      var thisMonth = moment().startOf('month');
      var nextMonth = moment().add(1, 'month').startOf('month');
      return moment(date).isBetween(thisMonth, nextMonth);
    };

    /**
     * Return a string from a date suitable for speech synthesis.
     *
     * @param {Date} date
     * @return {string}
     */


    Confirmation.prototype[p$8.formatHoursAndMinutes] = function (date) {
      date = moment(date);
      var format = void 0;

      if (date.minute() === 0) {
        format = date.format('h A'); // 7 PM
      } else if (date.minute() === 15) {
        format = date.format('[quarter past] h A');
      } else if (date.minute() === 30) {
        format = date.format('[half past] h A');
      } else if (date.minute() === 45) {
        var nextHour = date.add(1, 'hour');
        format = nextHour.format('[quarter to] h A');
      } else {
        format = date.format('h m A'); // 6 24 AM
      }

      // Some speech synthesisers pronounce "AM" as in "ham" (not "A. M.").
      return format.replace(/ AM$/gi, ' A.M.').replace(/ PM$/gi, ' P.M.');
    };

    return Confirmation;
  }();

  /**
   * Parse day periods according to CLDR.
   * @see http://www.unicode.org/cldr/charts/29/verify/dates/en.html
   */
  var dayPeriodsParser = new chrono.Parser();
  dayPeriodsParser.pattern = function () {
    return new RegExp('midnight|morning|in the morning|noon|' + 'afternoon|in the afternoon|evening|in the evening|night|at night', 'i');
  };
  dayPeriodsParser.extract = function (text, ref, match) {
    var hour = void 0;
    var meridiem = void 0;

    switch (match[0].toLowerCase()) {
      case 'midnight':
        hour = 0;
        meridiem = 0;
        break;
      case 'morning':
      case 'in the morning':
        hour = 9;
        meridiem = 0;
        break;
      case 'noon':
        hour = 12;
        meridiem = 1;
        break;
      case 'afternoon':
      case 'in the afternoon':
        hour = 15;
        meridiem = 1;
        break;
      case 'evening':
      case 'in the evening':
        hour = 19;
        meridiem = 1;
        break;
      case 'night':
      case 'at night':
        hour = 10;
        meridiem = 1;
        break;
    }

    return new chrono.ParsedResult({
      ref,
      text: match[0],
      index: match.index,
      start: {
        hour,
        meridiem
      }
    });
  };

  /**
   * When the meridiem is not specified, set the time to after the current time.
   * `at 5 today` (current time is 3pm) => `5pm`.
   */
  var forwardHoursRefiner = new chrono.Refiner();
  forwardHoursRefiner.refine = function (text, results) {
    var opt = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    if (opt.forwardHoursOnly !== true) {
      return results;
    }

    // If the date is today and there is no AM/PM (meridiem) specified,
    // let all the time be after the current time.
    results.forEach(function (result) {
      changeDate(result.start, result.ref);
      if (result.end) {
        changeDate(result.end, result.ref);
      }
    });

    return results;

    function changeDate(component, ref) {
      if (!component.isCertain('meridiem') && component.moment(ref).isSame(component, 'day') && component.get('hour') <= ref.getHours()) {
        component.assign('meridiem', 1);
        component.assign('hour', component.get('hour') + 12);
      }
    }
  };

  var customChrono = new chrono.Chrono(chrono.options.casualOption());
  customChrono.parsers.push(dayPeriodsParser);
  customChrono.refiners.push(forwardHoursRefiner);

  var chrono$1 = {
    parse: function (phrase) {
      return customChrono.parse(phrase, new Date(), {
        forwardDatesOnly: true,
        forwardHoursOnly: true
      });
    }
  };

  /*
  Examples of supported phrases:
  Remind me to pick Sasha from Santa Clara University at 5PM today.
  Remind me that it is picnic day on July 4th.
  Remind us to go to the opera at 7:15pm on 2nd February.
  Remind us to go at my mum's at 11:30am on 31st July.
  Remind everybody to pack their stuff by next Friday 5pm.
  Remind me that every Tuesday night is trash day.

  To add:
  Remind me every Tuesday to take the bin out.
  Remind Guillaume on Thursdays evening to go to his drawing class.
  Remind me that I should prepare my appointment tomorrow morning.
  */

  /*
   * @todo:
   *   * Use CLDR to:
   *     * Generate placeholders.users
   *     * Generate placeholders.listBreaker
   *     * Generate placeholders.punctuation
   */

  var p$7 = Object.freeze({
    // Properties
    confirmation: Symbol('confirmation'),
    patterns: Symbol('patterns'),

    // Methods
    parseUsers: Symbol('parseUsers'),
    parseAction: Symbol('parseAction'),
    parseDatetime: Symbol('parseDatetime'),
    normalise: Symbol('normalise'),
    init: Symbol('init'),
    buildPatterns: Symbol('buildPatterns'),
    splitOnPlaceholders: Symbol('splitOnPlaceholders'),
    escape: Symbol('escape')
  });

  var PATTERNS = {
    en: {
      patterns: [`Remind [users] to [action] at [time].`, `Remind [users] to [action] on [time].`, `Remind [users] to [action] by [time].`, `Remind [users] at [time] to [action].`, `Remind [users] on [time] to [action].`, `Remind [users] by [time] to [action].`, `Remind [users] to [action].`, `Remind [users] that it is [action] on [time].`, `Remind [users] that it is [action] at [time].`, `Remind [users] that it is [action] by [time].`, `Remind [users] that it is [action].`, `Remind [users] that [action] at [time].`, `Remind [users] that [action] on [time].`, `Remind [users] that [action] by [time].`, `Remind [users] that [action].`, `Remind [users] that [time] is [action].`, `Remind [users] about [action] on [time].`, `Remind [users] about [action] at [time].`, `Remind [users] about [action] by [time].`, `Remind [users] about [action].`],
      placeholders: {
        users: '( \\S+ | \\S+,? and \\S+ )',
        action: '(.+)',
        time: '(.+)'
      },
      // @see http://www.unicode.org/cldr/charts/29/summary/en.html#4
      punctuation: new RegExp(`[-‐–—,;:!?.…'‘’"“”()\\[\\]§@*/&#†‡′″]+$`, 'u'),
      // @see http://www.unicode.org/cldr/charts/29/summary/en.html#6402
      listBreaker: new RegExp(`,|, and\\b|\\band\\b`, 'gu')
    },
    fr: {
      patterns: [`Rappelle [users] de [action] [time].`, `Rappelle [users] d'[action] [time].`, `Rappelle-[users] de [action] [time].`, `Rappelle-[users] d'[action] [time].`],
      placeholders: {
        users: '( \\S+ | \\S+ et \\S+ )',
        action: '(.+)',
        time: '(.+)'
      },
      punctuation: new RegExp(`[-‐–—,;:!?.…’"“”«»()\\[\\]§@*/&#†‡]+$`, 'u'),
      listBreaker: new RegExp(`,|\\bet\\b`, 'gu')
    },
    ja: {
      patterns: [`[time][action]を[users]に思い出させて。`, `[time][users]に[action]を思い出させて。`, `[time][users]は[action]と言うリマインダーを作成して。`],
      placeholders: {
        users: '(\\S+|\\S+、\\S+)',
        action: '(.+)',
        time: '(.+)'
      },
      punctuation: new RegExp(`[-‾_＿－‐—―〜・･,，、､;；:：!！?？.．‥…。｡＇‘’"＂“”(（)）\\[［\\]］{｛}｝` + `〈〉《》「｢」｣『』【】〔〕‖§¶@＠*＊/／\＼&＆#＃%％‰†‡′″〃※]+$`, 'u'),
      listBreaker: new RegExp(`、`, 'gu')
    }
  };

  var ReminderParser = function () {
    function ReminderParser() {
      var locale = arguments.length <= 0 || arguments[0] === undefined ? 'en' : arguments[0];
      classCallCheck(this, ReminderParser);

      this.locale = locale;
      this[p$7.confirmation] = new Confirmation(locale);
      this[p$7.patterns] = {};

      this[p$7.init]();

      Object.seal(this);
    }

    ReminderParser.prototype.parse = function parse() {
      var _this = this;

      var phrase = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return new Promise(function (resolve, reject) {
        if (!phrase) {
          console.error('Empty string.');
          return reject(null);
        }

        phrase = _this[p$7.normalise](phrase);

        var _p$parseDatetime = _this[p$7.parseDatetime](phrase);

        var due = _p$parseDatetime.due;
        var processedPhrase = _p$parseDatetime.processedPhrase;


        if (!due) {
          console.error('Time could not be parsed.');
          return reject(null);
        }

        var successful = _this[p$7.patterns][_this.locale].some(function (pattern) {
          if (!pattern.regexp.test(processedPhrase)) {
            return false;
          }

          var segments = pattern.regexp.exec(processedPhrase);
          segments.shift();

          var recipients = _this[p$7.parseUsers](segments[pattern.placeholders.users], phrase);
          var action = _this[p$7.parseAction](segments[pattern.placeholders.action], phrase);

          // The original pattern matching the intent.
          var match = pattern.match;

          var confirmation = _this[p$7.confirmation].getReminderMessage({
            recipients,
            action,
            due,
            match
          });

          resolve({ recipients, action, due, confirmation });
          return true;
        });

        if (!successful) {
          console.error('Unsupported intent format.');
          return reject(null);
        }
      });
    };

    ReminderParser.prototype[p$7.parseUsers] = function () {
      var string = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return string.split(PATTERNS[this.locale].listBreaker).map(function (user) {
        return user.trim();
      });
    };

    ReminderParser.prototype[p$7.parseAction] = function () {
      var string = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return string.trim();
    };

    ReminderParser.prototype[p$7.parseDatetime] = function () {
      var phrase = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      phrase = phrase.trim();

      var dates = chrono$1.parse(phrase);

      if (!dates.length) {
        return { time: null, processedPhrase: '' };
      }

      if (dates.length > 1) {
        console.error('More than 2 temporal components detected.');
      }

      var date = dates[0];
      var due = Number(date.start.date());

      var processedPhrase = phrase.substr(0, date.index) + phrase.substr(date.index + date.text.length);

      return { due, processedPhrase };
    };

    ReminderParser.prototype[p$7.normalise] = function () {
      var string = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
      var locale = arguments.length <= 1 || arguments[1] === undefined ? this.locale : arguments[1];

      // Normalise whitespaces to space.
      return string.replace(/\s+/g, ' ')
      // The Web Speech API returns PM hours as `p.m.`.
      .replace(/([0-9]) p\.m\./gi, '$1 PM').replace(/([0-9]) a\.m\./gi, '$1 AM').trim()
      // Strip punctuations.
      .replace(PATTERNS[locale].punctuation, '');
    };

    /**
     * Build the `patterns` property as an object mapping locale code to list of
     * patterns.
     */


    ReminderParser.prototype[p$7.init] = function () {
      var _this2 = this;

      Object.keys(PATTERNS).forEach(function (locale) {
        _this2[p$7.patterns][locale] = PATTERNS[locale].patterns.map(function (phrase) {
          return _this2[p$7.buildPatterns](locale, phrase, PATTERNS[locale].placeholders);
        });
      });
    };

    ReminderParser.prototype[p$7.buildPatterns] = function () {
      var locale = arguments.length <= 0 || arguments[0] === undefined ? this.locale : arguments[0];

      var _this3 = this;

      var match = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
      var placeholders = arguments[2];

      var phrase = this[p$7.normalise](match, locale);
      var tokens = this[p$7.splitOnPlaceholders](phrase);
      var order = {};
      var placeholderIndex = 0;

      var pattern = tokens.map(function (token) {
        if (token.startsWith('[')) {
          var placeholder = token.substr(1)
          // Strip trailing `]` if any.
          .replace(new RegExp('\\]$', 'u'), '');

          // The order of the placeholders can be different depending on the
          // pattern or language. When we parse a string, we need to match the
          // regexp captured masks to the placeholder given its position.
          order[placeholder] = placeholderIndex;
          placeholderIndex++;

          return placeholders[placeholder];
        }

        if (token === ' ') {
          return '\\b \\b';
        }

        // Leading and trailing spaces are changed to word boundary.
        return _this3[p$7.escape](token).replace(new RegExp('^ ', 'u'), '\\b').replace(new RegExp(' $', 'u'), '\\b');
      });

      var regexp = new RegExp(`^${ pattern.join('') }$`, 'iu');

      return { regexp, placeholders: order, match };
    };

    /**
     * Split the input phrase along the placeholders noted into brackets:
     * `Meet [users] on [time].` => ['Meet ', '[users]', ' on ', '[time]', '.']
     *
     * @param {string} phrase
     * @return {Array.<string>}
     */


    ReminderParser.prototype[p$7.splitOnPlaceholders] = function (phrase) {
      var tokens = [''];
      var index = 0;

      phrase.split('').forEach(function (c) {
        if (c === '[' && tokens[index] !== '') {
          index++;
          tokens[index] = '';
        }

        tokens[index] += c;

        if (c === ']') {
          index++;
          tokens[index] = '';
        }
      });

      return tokens;
    };

    /**
     * Escape characters to be used inside a RegExp as static patterns.
     *
     * @param {string} string
     * @return {string}
     */


    ReminderParser.prototype[p$7.escape] = function (string) {
      return string.replace(new RegExp('\\.', 'gu'), '\\.').replace(new RegExp('\\/', 'gu'), '\\/').replace(new RegExp('\\(', 'gu'), '\\(').replace(new RegExp('\\)', 'gu'), '\\)');
    };

    return ReminderParser;
  }();

  // Mostly a dummy placeholder for now.
  var QueryParser = function () {
    function QueryParser() {
      var locale = arguments.length <= 0 || arguments[0] === undefined ? 'en' : arguments[0];
      classCallCheck(this, QueryParser);

      this.locale = locale;

      Object.seal(this);
    }

    QueryParser.prototype.parse = function parse() {
      return Promise.resolve(null);
    };

    return QueryParser;
  }();

  var p$6 = Object.freeze({
    // Properties
    parsers: Symbol('parsers')
  });

  var IntentParser = function () {
    function IntentParser() {
      classCallCheck(this, IntentParser);

      this[p$6.parsers] = [new ReminderParser(), new QueryParser()];

      window.intentParser = this;
    }

    IntentParser.prototype.parse = function parse() {
      var phrase = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      var promises = this[p$6.parsers].map(function (parser) {
        return parser.parse(phrase);
      });

      // Return the first non null parsed result.
      return Promise.all(promises).then(function (results) {
        return results.find(function (result) {
          return !!result;
        });
      }).then(function (result) {
        return result || null;
      });
    };

    return IntentParser;
  }();

  var p$3 = Object.freeze({
    // Properties
    wakewordRecogniser: Symbol('wakewordRecogniser'),
    speechRecogniser: Symbol('speechRecogniser'),
    speechSynthesis: Symbol('speechSynthesis'),
    idle: Symbol('idle'),

    // Methods
    stopListeningForWakeword: Symbol('stopListeningForWakeword'),
    listenForUtterance: Symbol('listenForUtterance'),
    handleSpeechRecognitionEnd: Symbol('handleSpeechRecognitionEnd'),
    intentParser: Symbol('intentParser')
  });

  var EVENT_INTERFACE = [
  // Emit when the wakeword is being listened for
  'wakelistenstart',

  // Emit when the wakeword is no longer being listened for
  'wakelistenstop',

  // Emit when the wakeword is heard
  'wakeheard',

  // Emit when the speech recognition engine starts listening
  // (And _could_ be sending speech over the network)
  'speechrecognitionstart',

  // Emit when the speech recognition engine returns a recognised phrase
  'speechrecognitionstop',

  // Emit when an intent is successfully parsed and we have a reminder object.
  'reminder',

  // Emit when a reminder could not be parsed from a text.
  'parsing-failed'];

  var SpeechController = function (_EventDispatcher) {
    inherits(SpeechController, _EventDispatcher);

    function SpeechController() {
      classCallCheck(this, SpeechController);

      var _this = possibleConstructorReturn(this, _EventDispatcher.call(this, EVENT_INTERFACE));

      _this[p$3.idle] = true;

      _this[p$3.speechRecogniser] = new SpeechRecogniser();
      _this[p$3.speechSynthesis] = new SpeechSynthesis();
      _this[p$3.wakewordRecogniser] = new WakeWordRecogniser();
      _this[p$3.intentParser] = new IntentParser();

      _this[p$3.wakewordRecogniser].setOnKeywordSpottedCallback(function () {
        _this.emit(EVENT_INTERFACE[2], { type: EVENT_INTERFACE[2] });

        _this.startSpeechRecognition();
      });

      Object.seal(_this);
      return _this;
    }

    SpeechController.prototype.start = function start() {
      return this.startListeningForWakeword();
    };

    SpeechController.prototype.startSpeechRecognition = function startSpeechRecognition() {
      var _this2 = this;

      this[p$3.idle] = false;

      return this[p$3.stopListeningForWakeword]().then(this[p$3.listenForUtterance].bind(this)).then(this[p$3.handleSpeechRecognitionEnd].bind(this)).catch(function (err) {
        console.log('startSpeechRecognition err', err);
        _this2.emit(EVENT_INTERFACE[4], { type: EVENT_INTERFACE[4] });
      });
    };

    SpeechController.prototype.stopSpeechRecognition = function stopSpeechRecognition() {
      return this[p$3.speechRecogniser].abort().then(this.startListeningForWakeword.bind(this));
    };

    /**
     * Speak a text aloud.
     *
     * @param {string} text
     * @return {Promise} A promise that resolves when the utterance is finished.
     */


    SpeechController.prototype.speak = function speak() {
      var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

      return this[p$3.speechSynthesis].speak(text);
    };

    SpeechController.prototype.startListeningForWakeword = function startListeningForWakeword() {
      this.emit(EVENT_INTERFACE[0], { type: EVENT_INTERFACE[0] });
      this[p$3.idle] = true;

      return this[p$3.wakewordRecogniser].startListening();
    };

    SpeechController.prototype[p$3.stopListeningForWakeword] = function () {
      this.emit(EVENT_INTERFACE[1], { type: EVENT_INTERFACE[1] });
      return this[p$3.wakewordRecogniser].stopListening();
    };

    SpeechController.prototype[p$3.listenForUtterance] = function () {
      this.emit(EVENT_INTERFACE[3], { type: EVENT_INTERFACE[3] });
      return this[p$3.speechRecogniser].listenForUtterance();
    };

    SpeechController.prototype[p$3.handleSpeechRecognitionEnd] = function (result) {
      var _this3 = this;

      this.emit(EVENT_INTERFACE[4], { type: EVENT_INTERFACE[4], result });

      // Parse intent
      this[p$3.intentParser].parse(result.utterance).then(function (reminder) {
        _this3.emit(EVENT_INTERFACE[5], {
          type: EVENT_INTERFACE[5],
          result: reminder
        });
      }).catch(function (err) {
        _this3.emit(EVENT_INTERFACE[6], {
          type: EVENT_INTERFACE[6],
          result: result.utterance
        });

        console.error('Error while parsing the sentence:', err);
        console.error('Sentence was:', result.utterance);
      });
    };

    createClass(SpeechController, [{
      key: 'idle',
      get: function () {
        return this[p$3.idle];
      }
    }]);
    return SpeechController;
  }(EventDispatcher);

  function HttpError(statusCode) {
    this.message = `The response returned a ${ statusCode } HTTP status code.`;
    this.statusCode = statusCode;
    this.name = 'HttpError';
    Error.call(this);
  }

  HttpError.prototype = Object.create(Error.prototype);

  var p$10 = Object.freeze({
    // Private properties.
    settings: Symbol('settings'),
    online: Symbol('online'),

    // Private methods.
    init: Symbol('init'),
    fetch: Symbol('fetch')
  });

  var Network = function (_EventDispatcher) {
    inherits(Network, _EventDispatcher);

    function Network(settings) {
      classCallCheck(this, Network);

      var _this = possibleConstructorReturn(this, _EventDispatcher.call(this, ['online']));

      _this[p$10.settings] = settings;
      _this[p$10.online] = false;

      Object.seal(_this);

      _this[p$10.init]();
      return _this;
    }

    /**
     * Attach event listeners related to the connection status.
     */


    Network.prototype[p$10.init] = function () {
      var _this2 = this;

      this[p$10.online] = navigator.onLine;

      window.addEventListener('online', function (online) {
        _this2[p$10.online] = online;
        _this2.emit('online', online);
      });
      window.addEventListener('offline', function (online) {
        _this2[p$10.online] = online;
        _this2.emit('online', online);
      });

      if ('connection' in navigator && 'onchange' in navigator.connection) {
        navigator.connection.addEventListener('change', function () {
          var online = navigator.onLine;

          _this2[p$10.online] = online;
          _this2.emit('online', online);
        });
      }
    };

    /**
     * Request a JSON from a specified URL.
     *
     * @param {string} url The URL to send the request to.
     * @param {string} method The HTTP method (defaults to "GET").
     * @param {Object} body An object of key/value.
     * @return {Promise}
     */
    Network.prototype.fetchJSON = function fetchJSON(url) {
      var method = arguments.length <= 1 || arguments[1] === undefined ? 'GET' : arguments[1];
      var body = arguments.length <= 2 || arguments[2] === undefined ? undefined : arguments[2];

      var accept = 'application/json';
      return this[p$10.fetch](url, accept, method, body).then(function (response) {
        var contentType = response.headers.get('Content-Type') || '';
        if (response.ok && !contentType.startsWith(accept)) {
          return;
        }

        return response.json();
      });
    };

    /**
     * Request a Blob from a specified URL.
     *
     * @param {string} url The URL to send the request to.
     * @param {string} blobType The Blob mime type (eg. image/jpeg).
     * @param {string=} method The HTTP method (defaults to "GET").
     * @param {Object=} body An object of key/value.
     * @return {Promise<Blob>}
     */


    Network.prototype.fetchBlob = function fetchBlob(url, blobType, method, body) {
      return this[p$10.fetch](url, blobType, method, body).then(function (response) {
        return response.blob();
      });
    };

    /**
     * Request a content of the specified type from a specified URL.
     *
     * @param {string} url The URL to send the request to.
     * @param {string} accept The content mime type (eg. image/jpeg).
     * @param {string=} method The HTTP method (defaults to "GET").
     * @param {Object=} body An object of key/value.
     * @return {Promise<Response>}
     * @private
     */


    Network.prototype[p$10.fetch] = function (url, accept) {
      var method = arguments.length <= 2 || arguments[2] === undefined ? 'GET' : arguments[2];
      var body = arguments.length <= 3 || arguments[3] === undefined ? undefined : arguments[3];

      method = method.toUpperCase();

      var req = {
        method,
        headers: { Accept: accept },
        cache: 'no-store'
      };

      if (this[p$10.settings].session) {
        // The user is logged in, we authenticate the request.
        req.headers.Authorization = `Bearer ${ this[p$10.settings].session }`;
      }

      if (body !== undefined) {
        req.headers['Content-Type'] = 'application/json;charset=UTF-8';
        req.body = JSON.stringify(body);
      }

      return fetch(url, req).then(function (res) {
        if (!res.ok) {
          throw new HttpError(res.status);
        }

        return res;
      });
    };

    createClass(Network, [{
      key: 'origin',
      get: function () {
        return this[p$10.settings].origin;
      }
    }, {
      key: 'online',
      get: function () {
        return this[p$10.online];
      }
    }]);
    return Network;
  }(EventDispatcher);

  // Private members
  var p$11 = Object.freeze({
    // Properties,
    api: Symbol('api'),
    settings: Symbol('settings'),

    // Methods:
    listenForMessages: Symbol('listenForMessages')
  });

  var WebPush = function (_EventDispatcher) {
    inherits(WebPush, _EventDispatcher);

    function WebPush(api, settings) {
      classCallCheck(this, WebPush);

      var _this = possibleConstructorReturn(this, _EventDispatcher.call(this, ['message']));

      _this[p$11.api] = api;
      _this[p$11.settings] = settings;

      Object.seal(_this);
      return _this;
    }

    WebPush.prototype.subscribeToNotifications = function subscribeToNotifications() {
      var _this2 = this;

      if (!navigator.serviceWorker) {
        return Promise.reject('No service worker supported');
      }

      navigator.serviceWorker.addEventListener('message', this[p$11.listenForMessages].bind(this));

      return navigator.serviceWorker.ready.then(function (reg) {
        return reg.pushManager.getSubscription().then(function (existing) {
          return existing || reg.pushManager.subscribe({ userVisibleOnly: true });
        });
      }).then(function (subscription) {
        return (
          // The server checks for duplicates
          _this2[p$11.api].post('subscriptions', {
            subscription,
            title: `Browser ${ navigator.userAgent }`
          })
        );
      }).catch(function (error) {
        if (Notification.permission === 'denied') {
          throw new Error('Permission request was denied.');
        }

        // "409 Conflict" HTTP result is OK.
        if (error instanceof HttpError && error.statusCode === 409) {
          return;
        }

        throw new Error(`There was an error while subscribing to push notifications: ${ error }`);
      });
    };

    WebPush.prototype[p$11.listenForMessages] = function (evt) {
      if (!evt.data) {
        console.error('Received a push message without a payload.');
        return;
      }
      this.emit('message', evt.data);
    };

    return WebPush;
  }(EventDispatcher);

  var p$12 = Object.freeze({
    settings: Symbol('settings'),
    net: Symbol('net'),

    // Private methods.
    getURL: Symbol('getURL'),
    onceOnline: Symbol('onceOnline'),
    onceReady: Symbol('onceReady'),
    getChannelValues: Symbol('getChannelValues'),
    updateChannelValue: Symbol('updateChannelValue')
  });

  /**
   * Instance of the API class is intended to abstract consumer from the API
   * specific details (e.g. API base URL and version). It also tracks
   * availability of the network, API host and whether correct user session is
   * established. If any of this conditions is not met all API requests are
   * blocked until it's possible to perform them, so consumer doesn't have to
   * care about these additional checks.
   */

  var API = function () {
    function API(net, settings) {
      classCallCheck(this, API);

      this[p$12.net] = net;
      this[p$12.settings] = settings;

      Object.freeze(this);
    }

    /**
     * Performs HTTP 'GET' API request and accepts JSON as response.
     *
     * @param {string} path Specific API resource path to be used in conjunction
     * with the base API path.
     * @return {Promise}
     */


    API.prototype.get = function get(path) {
      var _this = this;

      return this[p$12.onceReady]().then(function () {
        return _this[p$12.net].fetchJSON(_this[p$12.getURL](path));
      });
    };

    /**
     * Performs HTTP 'POST' API request and accepts JSON as response.
     *
     * @param {string} path Specific API resource path to be used in conjunction
     * with the base API path.
     * @param {Object=} body Optional object that will be serialized to JSON
     * string and sent as 'POST' body.
     * @return {Promise}
     */


    API.prototype.post = function post(path, body) {
      var _this2 = this;

      return this[p$12.onceReady]().then(function () {
        return _this2[p$12.net].fetchJSON(_this2[p$12.getURL](path), 'POST', body);
      });
    };

    /**
     * Performs HTTP 'PUT' API request and accepts JSON as response.
     *
     * @param {string} path Specific API resource path to be used in conjunction
     * with the base API path.
     * @param {Object=} body Optional object that will be serialized to JSON
     * string and sent as 'PUT' body.
     * @return {Promise}
     */


    API.prototype.put = function put(path, body) {
      var _this3 = this;

      return this[p$12.onceReady]().then(function () {
        return _this3[p$12.net].fetchJSON(_this3[p$12.getURL](path), 'PUT', body);
      });
    };

    /**
     * Performs HTTP 'DELETE' API request and accepts JSON as response.
     *
     * @param {string} path Specific API resource path to be used in conjunction
     * with the base API path.
     * @param {Object=} body Optional object that will be serialized to JSON
     * string and sent as 'DELETE' body.
     * @return {Promise}
     */


    API.prototype.delete = function _delete(path, body) {
      var _this4 = this;

      return this[p$12.onceReady]().then(function () {
        return _this4[p$12.net].fetchJSON(_this4[p$12.getURL](path), 'DELETE', body);
      });
    };

    /**
     * Performs either HTTP 'GET' or 'PUT' (if body parameter is specified) API
     * request and accepts Blob as response.
     *
     * @param {string} path Specific API resource path to be used in conjunction
     * with the base API path.
     * @param {Object=} body Optional object that will be serialized to JSON
     * string and sent as 'PUT' body.
     * @param {string=} accept Mime type of the Blob we expect as a response
     * (default is image/jpeg).
     * @return {Promise}
     */


    API.prototype.blob = function blob(path, body) {
      var _this5 = this;

      var accept = arguments.length <= 2 || arguments[2] === undefined ? 'image/jpeg' : arguments[2];

      return this[p$12.onceReady]().then(function () {
        if (body) {
          return _this5[p$12.net].fetchBlob(_this5[p$12.getURL](path), accept, 'PUT', body);
        }

        return _this5[p$12.net].fetchBlob(_this5[p$12.getURL](path), accept);
      });
    };

    /**
     * Creates a fully qualified API URL based on predefined base origin, API
     * version and specified resource path.
     *
     * @param {string} path Specific API resource path to be used in conjunction
     * with the base API path and version.
     * @return {string}
     * @private
     */


    API.prototype[p$12.getURL] = function (path) {
      if (!path || typeof path !== 'string') {
        throw new Error('Path should be a valid non-empty string.');
      }

      return `${ this[p$12.net].origin }/api/v${ this[p$12.settings].apiVersion }/${ path }`;
    };

    /**
     * Returns a promise that is resolved once API is ready to use (API host is
     * online).
     * In the future we can add more checks like:
     * * User is authenticated
     * * Document is visible
     *
     * @returns {Promise}
     * @private
     */


    API.prototype[p$12.onceReady] = function () {
      return Promise.all([this[p$12.onceOnline]()]);
    };

    /**
     * Returns a promise that is resolved once API host is discovered and online.
     *
     * @returns {Promise}
     * @private
     */


    API.prototype[p$12.onceOnline] = function () {
      var net = this[p$12.net];
      if (net.online) {
        return Promise.resolve();
      }

      return new Promise(function (resolve) {
        return net.once('online', function () {
          return resolve();
        });
      });
    };

    return API;
  }();

  var p$13 = Object.freeze({
    api: Symbol('api'),
    settings: Symbol('settings')
  });

  var Reminders$1 = function () {
    function Reminders(api, settings) {
      classCallCheck(this, Reminders);

      this[p$13.api] = api;
      this[p$13.settings] = settings;

      Object.seal(this);
    }

    /**
     * Retrieves the list of the reminders.
     *
     * @return {Promise<Array>} A promise that resolves with an array of objects.
     */


    Reminders.prototype.getAll = function getAll() {
      return this[p$13.api].get('reminders');
    };

    /**
     * Gets a reminder given its id.
     *
     * @param {string} id The ID of the reminder to retrieve.
     * @return {Promise}
     */


    Reminders.prototype.get = function get(id) {
      return this[p$13.api].get(`reminders/${ id }`);
    };

    /**
     * Create a new reminder.
     *
     * @param {Object} body
     * @return {Promise}
     */


    Reminders.prototype.set = function set(body) {
      return this[p$13.api].post(`reminders`, body);
    };

    /**
     * Create a new reminder.
     *
     * @param {Object} body
     * @return {Promise}
     */


    Reminders.prototype.update = function update(body) {
      var id = body.id;

      if (isNaN(id) || typeof id !== 'number') {
        return Promise.reject(new Error('The reminder id is not a number.'));
      }

      return this[p$13.api].put(`reminders/${ id }`, body);
    };

    /**
     * Delete a reminder given its ID.
     *
     * @param {string} id The ID of the reminder to delete.
     * @return {Promise}
     */


    Reminders.prototype.delete = function _delete(id) {
      return this[p$13.api].delete(`reminders/${ id }`);
    };

    return Reminders;
  }();

  // Private members.
  var p$9 = Object.freeze({
    // Private properties.
    settings: Symbol('settings'),
    net: Symbol('net'),
    webPush: Symbol('webPush'),
    api: Symbol('api')
  });

  var Server = function (_EventDispatcher) {
    inherits(Server, _EventDispatcher);

    function Server() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var settings = _ref.settings;
      var net = _ref.net;
      classCallCheck(this, Server);

      // Private properties.
      var _this = possibleConstructorReturn(this, _EventDispatcher.call(this, ['login', 'online', 'push-message']));

      _this[p$9.settings] = settings || new Settings();
      _this[p$9.net] = net || new Network(_this[p$9.settings]);
      _this[p$9.api] = new API(_this[p$9.net], _this[p$9.settings]);
      _this[p$9.webPush] = new WebPush(_this[p$9.api], _this[p$9.settings]);

      // Init
      _this.reminders = new Reminders$1(_this[p$9.api], _this[p$9.settings]);

      _this[p$9.net].on('online', function (online) {
        return _this.emit('online', online);
      });
      _this[p$9.webPush].on('message', function (msg) {
        return _this.emit('push-message', msg);
      });

      window.server = _this;

      Object.seal(_this);
      return _this;
    }

    /**
     * Authenticate a user.
     *
     * @param {string} user
     * @param {string} password
     * @return {Promise}
     */
    Server.prototype.login = function login(user, password) {
      var _this2 = this;

      return this[p$9.api].post('login', { user, password }).then(function (res) {
        _this2[p$9.settings].session = res.token;
        _this2.emit('login');
      });
    };

    /**
     * Log out the user.
     *
     * @return {Promise}
     */


    Server.prototype.logout = function logout() {
      this[p$9.settings].session = null;
      return Promise.resolve();
    };

    /**
     * Ask the user to accept push notifications from the server.
     * This method will be called each time that we log in, but will stop the
     * execution if we already have the push subscription information.
     *
     * @return {Promise}
     */


    Server.prototype.subscribeToNotifications = function subscribeToNotifications() {
      if (!this.isLoggedIn) {
        return Promise.reject(new Error('Error while subscribing to push notifications: user is not logged in'));
      }
      return this[p$9.webPush].subscribeToNotifications();
    };

    Server.prototype.clearServiceWorker = function clearServiceWorker() {
      if (navigator.serviceWorker) {
        return navigator.serviceWorker.ready.then(function (registration) {
          return registration.unregister();
        });
      }

      return Promise.resolve();
    };

    createClass(Server, [{
      key: 'online',
      get: function () {
        return this[p$9.net].online;
      }
    }, {
      key: 'isLoggedIn',
      get: function () {
        return !!this[p$9.settings].session;
      }
    }]);
    return Server;
  }(EventDispatcher);

  var p$2 = Object.freeze({
    controllers: Symbol('controllers'),
    speechController: Symbol('speechController'),
    server: Symbol('server'),
    subscribeToNotifications: Symbol('subscribeToNotifications'),
    settings: Symbol('settings'),
    initHub: Symbol('initHub'),

    onHashChanged: Symbol('onHashChanged')
  });

  var MainController = function (_BaseController) {
    inherits(MainController, _BaseController);

    function MainController(props) {
      classCallCheck(this, MainController);

      var _this = possibleConstructorReturn(this, _BaseController.call(this, props));

      var mountNode = document.querySelector('.app-view-container');
      var speechController = new SpeechController();
      var settings = _this.settings;
      var server = new Server({ settings });
      var options = { mountNode, speechController, server, settings };

      var usersController = new UsersController(options);
      var remindersController = new RemindersController(options);

      _this[p$2.controllers] = {
        '': usersController,
        'users/(.+)': usersController,
        'reminders': remindersController
      };

      _this[p$2.speechController] = speechController;
      _this[p$2.server] = server;
      _this[p$2.settings] = settings;
      _this[p$2.initHub]();

      window.addEventListener('hashchange', _this[p$2.onHashChanged].bind(_this));
      return _this;
    }

    MainController.prototype.main = function main() {
      var _this2 = this;

      this[p$2.speechController].start().then(function () {
        console.log('Speech controller started');
      });

      this[p$2.server].on('login', function () {
        return _this2[p$2.subscribeToNotifications]();
      });
      this[p$2.server].on('push-message', function (message) {
        if (_this2[p$2.settings].isHub) {
          _this2[p$2.speechController].speak(`${ message.title }: ${ message.body }`);
        }
      });

      location.hash = '';

      setTimeout(function () {
        if (_this2[p$2.server].isLoggedIn) {
          _this2[p$2.subscribeToNotifications]();
          location.hash = 'reminders';
        } else {
          location.hash = 'users/login';
        }
      });
    };

    /**
     * Clear all data/settings stored on the browser. Use with caution.
     *
     * @param {boolean} ignoreServiceWorker
     * @return {Promise}
     */


    MainController.prototype.clear = function clear() {
      var ignoreServiceWorker = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var promises = [this[p$2.settings].clear()];

      if (!ignoreServiceWorker) {
        promises.push(this[p$2.server].clearServiceWorker());
      }

      return Promise.all(promises);
    };

    /**
     * Handles hash change event and routes to the right controller.
     *
     * @private
     */


    MainController.prototype[p$2.onHashChanged] = function () {
      var route = window.location.hash.slice(1);

      for (var routeName of Object.keys(this[p$2.controllers])) {
        var match = route.match(new RegExp(`^${ routeName }$`));
        if (match) {
          var _p$controllers$routeN;

          (_p$controllers$routeN = this[p$2.controllers][routeName]).main.apply(_p$controllers$routeN, toConsumableArray(match.slice(1)));
          break;
        }
      }

      this[p$2.initHub]();
    };

    MainController.prototype[p$2.subscribeToNotifications] = function () {
      this[p$2.server].subscribeToNotifications().catch(function (err) {
        console.error('Error while subscribing to notifications:', err);
      });
    };

    /**
     * Will init the `isHub` property, which controls whether the device is
     * a group/family device or a member's personal device.
     *
     * This works by using a specific hash while loading or running the
     * application.
     * Recognised syntaxes are: #hub=1/true/0/false
     */


    MainController.prototype[p$2.initHub] = function () {
      var match = location.hash.match(/\bhub=(.+)(&|$)/);

      if (match) {
        var matchedValue = match[1];
        var isHub = matchedValue === '1' || matchedValue === 'true';

        console.log('Setting the `isHub` property to ', isHub);
        this[p$2.settings].isHub = isHub;

        // Redirect to the root of the application.
        location.hash = '';
        location.reload();
      }
    };

    return MainController;
  }(BaseController);

  var options = { settings: new Settings() };

  new Analytics(options);
  var mainController = new MainController(options);
  mainController.main();

  window.app = mainController;

});