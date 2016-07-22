"use strict";

class Mediator {

  constructor() {
    this._channels = {};
  }

  when(channel, handler) {
    if (!this._channels[channel]) {
      this._channels[channel] = [];
    }

    mediator._channels[channel].push(handler);

    return this;
  }

  emit(channel, ...args) {
    if (!this._channels[channel]) {
      return;
    }

    var length = this._channels[channel].length;

    for (let i = 0; i < length; i++) {
      let subscription = mediator._channels[channel][i];
      subscription.apply(null, args);
    }

    return this;
  }

  delete(channel) {
    if (!this._channels[channel]) {
      return false;
    }

    delete this._channels[channel];

    return this;
  }
}

export default Mediator;
