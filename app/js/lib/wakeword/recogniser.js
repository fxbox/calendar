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

export default class WakeWordRecogniser {
  constructor() {
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

    const dictionary = {
      'MAKE': ['M EY K', 'M AH K'],
      'A': ['AH', 'EY', 'ER'],
      'NOTE': ['N OW T', 'N AO T'],
    };

    const keywordReady = this.recogniser.addDictionary(dictionary)
      .then(() => this.recogniser.addKeyword('MAKE A NOTE'));

    this.ready = Promise.all([keywordReady, this.audioSource]);
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

  setOnKeywordSpottedCallback(fn) {
    this.recogniser.on('keywordspotted', fn);
  }
}
