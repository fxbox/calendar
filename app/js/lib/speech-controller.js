import EventDispatcher from './common/event-dispatcher';
import WakeWordRecognizer from './wakeword/recogniser.js';

const p = Object.freeze({
  wakewordRecognizer: Symbol('wakewordRecognizer'),
  wakewordModelUrl:   Symbol('wakewordModelUrl'),
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
      this._handleKeywordSpotted.bind(this));

    this[p.wakewordRecognizer] = recognizer;
    this[p.wakewordModelUrl] = '/data/wakeword_model.json';
  }

  _initializeSpeechRecognition() {
    return fetch('/data/wakeword_model.json')
             .then((response) => response.json())
             .then((model) => {
               this[p.wakewordRecognizer].loadModel(model);
             });
  }

  start() {
    return this._initializeSpeechRecognition()
             .then(this._startListeningForWakeword.bind(this));
  }

  _startListeningForWakeword() {
    this.emit(EVENT_INTERFACE[0]);
    return this[p.wakewordRecognizer].startListening();
  }

  _stopListeningForWakeword() {
    this.emit(EVENT_INTERFACE[1]);
    return this[p.wakewordRecognizer].stopListening();
  }

  _handleKeywordSpotted() {
    this.emit(EVENT_INTERFACE[2]);

    return this._stopListeningForWakeword()
             .then(this._startSpeechRecognition.bind(this))
             .then(this._handleSpeechRecognitionEnd.bind(this))
             .then(this._startListeningForWakeword.bind(this));
  }

  _startSpeechRecognition() {
    this.emit(EVENT_INTERFACE[3]);
    // Mock recognised phrase for now
    return Promise.resolve({
      phrase: 'remind me to pick up laundry on my way home this evening',
    });
  }

  _handleSpeechRecognitionEnd(result) {
    this.emit(EVENT_INTERFACE[4]);

    // Parse intent
    return this._parseIntent(result.phrase)
            .then(this._actOnIntent.bind(this));
  }

  _parseIntent() {
    // Parse  - return 'result' (TBD) async
    return Promise.resolve();
  }

  _actOnIntent() {
    // Act - return 'result' (TBD) async
    return Promise.resolve();
  }
}
