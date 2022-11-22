const finishSymbol = Symbol('end');

export default function mutationIterator(targetObj = {}) {
  let change;
  let emit = () => null;

  function watch() {
    change = new Promise((resolve) => {
      emit = resolve;
    });
  }

  const result = new Proxy(targetObj, {
    set(target, prop, value) {
      target[prop] = value; // eslint-disable-line no-param-reassign
      emit();
      return true;
    },

    get(target, prop) {
      if (prop === Symbol.asyncIterator) {
        return async function* iterator() {
          while (true) {
            if (await change) return; // eslint-disable-line no-await-in-loop
            watch();
            yield target;
          }
        };
      }

      if (prop === finishSymbol) {
        return () => emit(true);
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
