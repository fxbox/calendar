'use strict';

import PocketSphinx from 'components/webaudiokws';

export default class WakeWordRecogniser {
  constructor() {
    this.audioContext = new AudioContext();

    this.audioSource = navigator.mediaDevices.getUserMedia({
      audio: true,
    }).then((stream) => {
      return this.audioContext.createMediaStreamSource(stream);
    }).catch((error) => {
      console.error(`Could not getUserMedia: ${error}`);
      throw error;
    });

    this.recogniser = new PocketSphinx(this.audioContext, {
      pocketSphinxUrl: '/js/components/pocketsphinx.js',
      workerUrl: '/js/components/ps-worker.js',
      args: [['-kws_threshold', '1']],
    });

    const dictionary = {
      'MAKE': ['M EY K'],
      'A': ['AH'],
      'NOTE': ['N OW T'],
    };

    const keywordReady = this.recogniser.addDictionary(dictionary)
      .then(() => this.recogniser.addKeyword('MAKE A NOTE'));

    this.ready = Promise.all([keywordReady, this.audioSource]);

    window.recogniser = this;

    Object.seal(this);
  }

  startListening() {
    return this.ready.then(() => {
      return this.audioSource;
    }).then((source) => {
      console.log('Connecting source to recogniser');
      source.connect(this.recogniser);
      this.recogniser.connect(this.audioContext.destination);
      return;
    });
  }

  stopListening() {
    return this.ready.then(() => {
      return this.audioSource;
    }).then((source) => {
      console.log('Disconnecting source from recogniser');
      source.disconnect();
      this.recogniser.disconnect();
      return;
    });
  }

  setOnKeywordSpottedCallback(fn) {
    this.recogniser.on('keywordspotted', () => {
      fn();
    });
  }
}
