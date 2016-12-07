"use strict";

class Mediator {

  constructor() {
    this._channels = {};
  }

  matchesFilter(filter, match) {
    var keys = Object.keys(match), length = keys.length;
    if (filter == null) return !length;
    var obj = Object(filter);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (match[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  }

  when(channel, ...args) {
    if (!this._channels[channel]) {
      this._channels[channel] = [];
    }

    let handler, filter;

    if (args.length === 1) {
      handler = args[0];
      filter = null;
    }

    if (args.length === 2) {
      [filter, handler] = args;
    }

    this._channels[channel].push({ filter, handler });

    return this;
  }

  emit(channel, ...args) {
    if (!this._channels[channel]) {
      return;
    }

    let payload, filter;

    if (args.length === 1) {
      payload = args[0];
      filter = null;
    }

    if (args.length === 2) {
      [filter, payload] = args;
    }

    this._channels[channel].forEach(({handler, filter: match}) => {
      if (!filter || this.matchesFilter(filter, match))
        handler(payload);
    });

    return this;
  }

  delete(channel, handler=null) {
    if (!this._channels[channel]) {
      return false;
    }

    if (!handler) {
      delete this._channels[channel];
    } else {
      const index = this._channels[channel].findIndex(({handler: channelHandler}) => {
        if (channelHandler === handler) {
          return true;
        }
      });

      if (index === -1) {
        return false;
      }

      this._channels[channel].splice(index, 1);
    }

    return this;
  }

  extend(extendee) {
    extendee.emit = Mediator.prototype.emit.bind(this);
    extendee.when = Mediator.prototype.when.bind(this);
  }
}

export default Mediator;