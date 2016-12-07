"use strict";

const mediator = function mediator() {

  const channels = {};

  const matchesFilter = function(filter, match) {
    const keys = Object.keys(match);
    const length = keys.length;

    for (let key of keys) {
      if (match[key] !== filter[key] || !(key in filter)) {
        return false;
      }
    }

    return true;
  }

  return {
    when(channel, ...args) {
      if (!channels[channel]) {
        channels[channel] = [];
      }

      let handler, filter;

      if (args.length === 1) {
        handler = args[0];
        filter = null;
      }

      if (args.length === 2) {
        [filter, handler] = args;
      }

      channels[channel].push({ filter, handler });

      return this;
    },

    emit(channel, ...args) {
      if (!channels[channel]) {
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

      channels[channel].forEach(({handler, filter: toMatch}) => {
        if (!filter || matchesFilter(filter, toMatch)) {
          handler(payload);
        }
      });

      return this;
    },

    delete(channel, handler=null) {
      if (!channels[channel]) {
        return false;
      }

      if (!handler) {
        delete channels[channel];
      } else {
        const index = channels[channel].findIndex(({handler: channelHandler}) => {
          if (channelHandler === handler) {
            return true;
          }
        });

        if (index === -1) {
          return false;
        }

        channels[channel].splice(index, 1);
      }

      return this;
    }
  };
};

export default mediator;
