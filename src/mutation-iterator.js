const finishSymbol = Symbol('end');

export default function mutationIterator(targetObj = {}) {
  let watcher;
  let emitChange = () => null;

  function watch() {
    watcher = new Promise((resolve) => {
      emitChange = resolve;
    });
  }

  const result = new Proxy(targetObj, {
    set(target, prop, value) {
      target[prop] = value; // eslint-disable-line no-param-reassign
      emitChange(true);
      watch();
      return true;
    },

    get(target, prop) {
      if (prop === Symbol.asyncIterator) {
        return async function* iterator() {
          while (true) {
            const shouldTerminate = !await watcher; // eslint-disable-line no-await-in-loop
            if (shouldTerminate) return target;
            yield target;
          }
        };
      }

      if (prop === finishSymbol) {
        return () => emitChange(false);
      }

      return target[prop];
    }
  });

  watch();

  return result;
}

export function finish(iterator) {
  iterator[finishSymbol]();
}
