const finishSymbol = Symbol('end');

export default function mutationIterator(
  targetObj = {},
  { yieldInit = false, receiveEmitter = () => {} } = {}
) {
  let watcher;
  let emitChange = () => null;

  function emitter() {
    emitChange(true);
    watch();
  }

  receiveEmitter(emitter);

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

    get(target, prop, receiver) {
      if (prop === Symbol.asyncIterator) {
        return async function* iterator() {
          if (yieldInit) yield target;
          while (true) {
            const shouldTerminate = !(await watcher); // eslint-disable-line no-await-in-loop
            if (shouldTerminate) return target;
            yield target;
          }
        };
      }

      if (prop === finishSymbol) {
        return () => emitChange(false);
      }

      return Reflect.get(target, prop, receiver);
    }
  });

  watch();

  return result;
}

export function finish(iterator) {
  iterator[finishSymbol]();
}
