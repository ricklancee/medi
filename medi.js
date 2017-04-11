"use strict";

const medi = function medi(opts = { log:false }) {
  const channels = {};
  const shouldLog = opts.log;

  const log = {
      info() {
        if (!shouldLog)
          return;

        return console.info(...arguments);
      },
      warn() {
        if (!shouldLog)
          return;

        return console.warn(...arguments);
      }
  };

  const matchesFilter = function(filter, match) {
    const keys = Object.keys(match);

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
        log.warn(`Emit: No handlers for event: "${channel}", args: `, ...args);
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

      log.info(`Emitting event: "${channel}" with payload:`, payload, ' and filter: ', filter);

      const promises = [];

      channels[channel].forEach(({handler, filter: toMatch}) => {
          if (!filter && toMatch) {
            log.warn(`Trying to emit an even on a channel that has a filter, requires filter: "${JSON.stringify(toMatch)}"`);
            return;
          }

          if (!filter || (toMatch && matchesFilter(filter, toMatch))) {
            const result = handler(payload);
            if (result !== false && result !== undefined) {
              promises.push(new Promise(resolve => {
                resolve(result);
              }));
            }
          }
      });

      return Promise.all(promises);
    },

    delete(channel, handler=null) {
      if (!channels[channel]) {
        log.warn(`Delete: No handlers for channel "${channel}"`);
        return false;
      }

      if (!handler) {
        delete channels[channel];
        return this;
      }

      const index = channels[channel].findIndex(({handler: channelHandler}) => {
        if (channelHandler === handler) {
          return true;
        }

        return false;
      });

      if (index === -1) {
        return false;
      }

      channels[channel].splice(index, 1);

      return this;
    }
  };
};

export default medi;
