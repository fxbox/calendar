'use strict';

import EventDispatcher from './common/event-dispatcher';
import WakeWordRecognizer from './wakeword/recogniser.js';

const p = Object.freeze({
  // Properties
  wakewordRecognizer: Symbol('wakewordRecognizer'),
  wakewordModelUrl: Symbol('wakewordModelUrl'),

  // Methods
  _initializeSpeechRecognition: Symbol('_initializeSpeechRecognition'),
  _startListeningForWakeword: Symbol('_startListeningForWakeword'),
  _stopListeningForWakeword: Symbol('_stopListeningForWakeword'),
  _handleKeywordSpotted: Symbol('_handleKeywordSpotted'),
  _startSpeechRecognition: Symbol('_startSpeechRecognition'),
  _handleSpeechRecognitionEnd: Symbol('_handleSpeechRecognitionEnd'),
  _parseIntent: Symbol('_parseIntent'),
  _actOnIntent: Symbol('_actOnIntent'),
});

const EVENT_INTERFACE = [
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
];

export default class SpeechController extends EventDispatcher {
  constructor() {
    super(EVENT_INTERFACE);

    const recognizer = new WakeWordRecognizer();

    recognizer.setOnKeywordSpottedCallback(
      this[p._handleKeywordSpotted].bind(this));

    this[p.wakewordRecognizer] = recognizer;
    this[p.wakewordModelUrl] = '/data/wakeword_model.json';
  }

  [p._initializeSpeechRecognition]() {
    return fetch('/data/wakeword_model.json')
             .then((response) => response.json())
             .then((model) => {
               this[p.wakewordRecognizer].loadModel(model);
             });
  }

  start() {
    return this[p._initializeSpeechRecognition]()
             .then(this[p._startListeningForWakeword].bind(this));
  }

  [p._startListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[0]);
    return this[p.wakewordRecognizer].startListening();
  }

  [p._stopListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[1]);
    return this[p.wakewordRecognizer].stopListening();
  }

  [p._handleKeywordSpotted]() {
    this.emit(EVENT_INTERFACE[2]);

    return this[p._stopListeningForWakeword]()
             .then(this[p._startSpeechRecognition].bind(this))
             .then(this[p._handleSpeechRecognitionEnd].bind(this))
             .then(this[p._startListeningForWakeword].bind(this));
  }

  [p._startSpeechRecognition]() {
    this.emit(EVENT_INTERFACE[3]);
    // Mock recognised phrase for now
    return Promise.resolve({
      phrase: 'remind me to pick up laundry on my way home this evening',
    });
  }

  [p._handleSpeechRecognitionEnd](result) {
    this.emit(EVENT_INTERFACE[4]);

    // Parse intent
    return this[p._parseIntent](result.phrase)
            .then(this[p._actOnIntent].bind(this));
  }

  [p._parseIntent]() {
    // Parse  - return 'result' (TBD) async
    return Promise.resolve();
  }

  [p._actOnIntent]() {
    // Act - return 'result' (TBD) async
    return Promise.resolve();
  }
}
