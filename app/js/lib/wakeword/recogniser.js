import EventDispatcher from '../common/event-dispatcher';
import PocketSphinx from 'components/webaudiokws';

function promiseTimeout(p, timeout) {
  const timeoutPromise = new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });

  return Promise.race([
    timeoutPromise.then(() => { throw new Error('Timed out'); }),
    p,
  ]);
}

const EVENT_INTERFACE = [
  // Emit when the WakeWordRecogniser is ready to start listening
  'ready',

  // Emit when a word or phrase is recognised.
  'keywordspotted',
];

export default class WakeWordRecogniser extends EventDispatcher {
  constructor() {
    super(EVENT_INTERFACE);
    this.audioContext = new AudioContext();

    this.audioSource = promiseTimeout(navigator.mediaDevices.getUserMedia({
      audio: true,
    })
      .then((stream) => {
        return this.audioContext.createMediaStreamSource(stream);
      }), 10000)
      .catch((error) => {
        console.error(`Could not getUserMedia: ${error}`);
        throw error;
      });

    this.recogniser = new PocketSphinx(this.audioContext, {
      pocketSphinxUrl: 'pocketsphinx.js',
      workerUrl: 'js/components/ps-worker.js',
      args: [['-kws_threshold', '4']],
    });

    this.recogniser.on(EVENT_INTERFACE[1], (e) => {
      this.emit(EVENT_INTERFACE[1], e);
    });

    const dictionary = {
      'MAKE': ['M EY K', 'M AH K'],
      'A': ['AH', 'EY', 'ER'],
      'NOTE': ['N OW T', 'N AO T'],
    };

    const keywordReady = this.recogniser.addDictionary(dictionary)
      .then(() => this.recogniser.addKeyword('MAKE A NOTE'));

    this.ready = Promise.all([keywordReady, this.audioSource]);
    this.ready.then(() => {
      this.emit(EVENT_INTERFACE[0]);
    });

    Object.seal(this);
  }

  startListening() {
    return this.ready
      .then(() => {
        return this.audioSource;
      })
      .then((source) => {
        source.connect(this.recogniser);
        this.recogniser.connect(this.audioContext.destination);
        return;
      });
  }

  stopListening() {
    return this.ready
      .then(() => {
        return this.audioSource;
      })
      .then((source) => {
        source.disconnect();
        this.recogniser.disconnect();
      });
  }
}
