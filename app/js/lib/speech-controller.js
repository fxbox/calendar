'use strict';

import EventDispatcher from './common/event-dispatcher';
import WakeWordRecognizer from './wakeword/recogniser.js';

const p = Object.freeze({
  // Properties
  wakewordRecognizer: Symbol('wakewordRecognizer'),
  wakewordModelUrl: Symbol('wakewordModelUrl'),

  // Methods
  initializeSpeechRecognition: Symbol('initializeSpeechRecognition'),
  startListeningForWakeword: Symbol('startListeningForWakeword'),
  stopListeningForWakeword: Symbol('stopListeningForWakeword'),
  handleKeywordSpotted: Symbol('handleKeywordSpotted'),
  startSpeechRecognition: Symbol('startSpeechRecognition'),
  handleSpeechRecognitionEnd: Symbol('handleSpeechRecognitionEnd'),
  parseIntent: Symbol('parseIntent'),
  actOnIntent: Symbol('actOnIntent'),
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
      this[p.handleKeywordSpotted].bind(this));

    this[p.wakewordRecognizer] = recognizer;
    this[p.wakewordModelUrl] = '/data/wakeword_model.json';
  }

  [p.initializeSpeechRecognition]() {
    return fetch('/data/wakeword_model.json')
      .then((response) => response.json())
      .then((model) => {
        this[p.wakewordRecognizer].loadModel(model);
      });
  }

  start() {
    return this[p.initializeSpeechRecognition]()
      .then(this[p.startListeningForWakeword].bind(this));
  }

  [p.startListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[0]);
    return this[p.wakewordRecognizer].startListening();
  }

  [p.stopListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[1]);
    return this[p.wakewordRecognizer].stopListening();
  }

  [p.handleKeywordSpotted]() {
    this.emit(EVENT_INTERFACE[2]);

    return this[p.stopListeningForWakeword]()
      .then(this[p.startSpeechRecognition].bind(this))
      .then(this[p.handleSpeechRecognitionEnd].bind(this))
      .then(this[p.startListeningForWakeword].bind(this));
  }

  [p.startSpeechRecognition]() {
    this.emit(EVENT_INTERFACE[3]);
    // Mock recognised phrase for now
    return Promise.resolve({
      phrase: 'remind me to pick up laundry on my way home this evening',
    });
  }

  [p.handleSpeechRecognitionEnd](result) {
    this.emit(EVENT_INTERFACE[4]);

    // Parse intent
    return this[p.parseIntent](result.phrase)
      .then(this[p.actOnIntent].bind(this));
  }

  [p.parseIntent]() {
    // Parse  - return 'result' (TBD) async
    return Promise.resolve();
  }

  [p.actOnIntent]() {
    // Act - return 'result' (TBD) async
    return Promise.resolve();
  }
}
