const finishSymbol = Symbol('end');

export default function mutationIterator(target = {}) {
  let change;
  let emit = () => null;

  function watch() {
    change = new Promise((resolve) => {
      emit = resolve;
    });
  }

  const result = new Proxy(target, {
    set(target, prop, value) {
      target[prop] = value;
      emit();
      return true;
    },

    get(target, prop) {
      if (prop === Symbol.asyncIterator) {
        return async function*() {
          while(true) {
            if ( await change ) return;
            watch();
            yield target;
          }
        }
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
