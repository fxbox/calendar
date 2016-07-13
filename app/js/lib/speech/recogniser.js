'use strict';

const p = Object.freeze({
  isListening: Symbol('isListening'),
  recognition: Symbol('recognition'),
  supportsRecognition: Symbol('supportsRecognition'),
});

export default class SpeechRecogniser {
  constructor() {
    this[p.isListening] = false;

    const Recognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const supportsRecognition = !!Recognition;

    this[p.supportsRecognition] = supportsRecognition;

    if (supportsRecognition) {
      this[p.recognition] = new Recognition();
    } else {
      this[p.recognition] = null;
    }

    Object.seal(this);
  }

  listenForUtterance() {
    if (!this[p.supportsRecognition]) {
      return Promise.reject(
        new Error('Speech recognition not supported in this browser'));
    }

    return new Promise((resolve, reject) => {
      if (this[p.isListening]) {
        return reject(new Error('Speech recognition is already listening'));
      }

      this[p.isListening] = true;

      // Not using `addEventListener` here to avoid
      // `removeEventListener` everytime it's simpler
      // to just redefine `onresult` to the same effect.
      this[p.recognition].onresult = (event) => {
        this[p.recognition].stop();
        this[p.isListening] = false;

        // Always take first result
        const result = event.results[0][0];

        return resolve({
          confidence: result.confidence,
          utterance: result.transcript,
        });
      };

      this[p.recognition].onerror = (error) => {
        this[p.recognition].stop();
        this[p.isListening] = false;
        return reject(error);
      };

      this[p.recognition].start();
    });
  }

  abort() {
    // @xxx abort() should be used, but throws an error that puts the app in an
    // unusable state. In more details, when we used it, we kept getting a
    // SpeechRecognitionError with the code "network" (and no extra information)
    // Our investigation showed that network or the server side is not to blame
    // but it's a border effect of using webkitSpeechRecognition and
    // JsSpeechRecognizer at the same time.
    // Using stop() sends data to STT servers but we will get errors like
    // SpeechRecognitionError (code "no-speech") or if something was heard, the
    // pattern won't be matched.
    this[p.recognition].stop();
    this[p.isListening] = false;

    return Promise.resolve();
  }
}
