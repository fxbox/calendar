import EventDispatcher from './common/event-dispatcher';
import WakeWordRecogniser from './wakeword/recogniser';
import SpeechRecogniser from './speech/recogniser';
import SpeechSynthesis from './speech/synthesis';
import IntentParser from './intent-parser/index';

const p = Object.freeze({
  // Properties
  wakewordRecogniser: Symbol('wakewordRecogniser'),
  speechRecogniser: Symbol('speechRecogniser'),
  speechSynthesis: Symbol('speechSynthesis'),
  idle: Symbol('idle'),

  // Methods
  stopListeningForWakeword: Symbol('stopListeningForWakeword'),
  listenForUtterance: Symbol('listenForUtterance'),
  handleSpeechRecognitionEnd: Symbol('handleSpeechRecognitionEnd'),
  intentParser: Symbol('intentParser'),
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

  // Emit when an intent is successfully parsed and we have a reminder object.
  'reminder',

  // Emit when a reminder could not be parsed from a text.
  'parsing-failed',
];

export default class SpeechController extends EventDispatcher {
  constructor() {
    super(EVENT_INTERFACE);

    this[p.idle] = true;

    this[p.speechRecogniser] = new SpeechRecogniser();
    this[p.speechSynthesis] = new SpeechSynthesis();
    this[p.wakewordRecogniser] = new WakeWordRecogniser();
    this[p.intentParser] = new IntentParser();

    this[p.wakewordRecogniser].on('keywordspotted', () => {
      this.emit(EVENT_INTERFACE[2], { type: EVENT_INTERFACE[2] });

      this.startSpeechRecognition();
    });

    Object.seal(this);
  }

  get idle() {
    return this[p.idle];
  }

  start() {
    return this.startListeningForWakeword();
  }

  startSpeechRecognition() {
    this[p.idle] = false;

    return this[p.stopListeningForWakeword]()
      .then(this[p.listenForUtterance].bind(this))
      .then(this[p.handleSpeechRecognitionEnd].bind(this))
      .catch((err) => {
        console.log('startSpeechRecognition err', err);
        this.emit(EVENT_INTERFACE[4], { type: EVENT_INTERFACE[4] });
        this.stopSpeechRecognition();
      });
  }

  stopSpeechRecognition() {
    return this[p.speechRecogniser].abort()
      .then(this.startListeningForWakeword.bind(this));
  }

  /**
   * Speak a text aloud.
   *
   * @param {string} text
   * @return {Promise} A promise that resolves when the utterance is finished.
   */
  speak(text = '') {
    return this[p.speechSynthesis].speak(text);
  }

  startListeningForWakeword() {
    this.emit(EVENT_INTERFACE[0], { type: EVENT_INTERFACE[0] });
    this[p.idle] = true;

    return this[p.wakewordRecogniser].startListening();
  }

  [p.stopListeningForWakeword]() {
    this.emit(EVENT_INTERFACE[1], { type: EVENT_INTERFACE[1] });
    return this[p.wakewordRecogniser].stopListening();
  }

  [p.listenForUtterance]() {
    this.emit(EVENT_INTERFACE[3], { type: EVENT_INTERFACE[3] });
    return this[p.speechRecogniser].listenForUtterance();
  }

  [p.handleSpeechRecognitionEnd](result) {
    this.emit(EVENT_INTERFACE[4], { type: EVENT_INTERFACE[4], result });

    // Parse intent
    this[p.intentParser].parse(result.utterance)
      .then((reminder) => {
        this.emit(EVENT_INTERFACE[5], {
          type: EVENT_INTERFACE[5],
          result: reminder,
        });
      })
      .catch((err) => {
        this.emit(EVENT_INTERFACE[6], {
          type: EVENT_INTERFACE[6],
          result: result.utterance,
        });

        console.error('Error while parsing the sentence:', err);
        console.error('Sentence was:', result.utterance);
      });
  }
}
