'use strict';

import JsSpeechRecognizer from 'components/jsspeechrecognizer';

export default class WakeWordRecogniser {
  constructor(options = {}) {
    const minimumConfidence = options.minimumConfidence || 0.35;
    const bufferCount = options.bufferCount || 80;
    const maxVoiceActivityGap = options.maxVoiceActivityGap || 300;
    const numGroups = options.numGroups || 60;
    const groupSize = options.groupSize || 5;

    this.recogniser = new JsSpeechRecognizer();

    this.recogniser.keywordSpottingMinimumConfidence = minimumConfidence;
    this.recogniser.keywordSpottingBufferCount = bufferCount;
    this.recogniser.keywordSpottingMaxVoiceActivityGap = maxVoiceActivityGap;
    this.recogniser.numGroups = numGroups;
    this.recogniser.groupSize = groupSize;

    Object.seal(this);
  }

  startListening() {
    return new Promise((resolve) => {
      this.recogniser.closeMic(); // Make sure we don't start another instance
      this.recogniser.openMic();
      if (!this.recogniser.isRecording()) {
        this.recogniser.startKeywordSpottingRecording();
      }

      resolve();
    });
  }

  stopListening() {
    return new Promise((resolve) => {
      if (this.recogniser.isRecording()) {
        this.recogniser.stopRecording();
      }

      this.recogniser.closeMic();

      resolve();
    });
  }

  loadModel(modelData) {
    if (this.recogniser.isRecording()) {
      throw new Error(
        'Load the model data before listening for wakeword');
    }

    this.recogniser.model = modelData;
  }

  setOnKeywordSpottedCallback(fn) {
    this.recogniser.keywordSpottedCallback = fn;
  }
}
