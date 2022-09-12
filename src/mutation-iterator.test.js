import { strict as assert } from 'assert';

import mutationIterator, { finish } from './mutation-iterator.js';

test('Allows setting props', async () => {
  const obj = mutationIterator();
  obj.name = 'test';
  assert.deepEqual(obj, {
    name: 'test'
  });
});

test('Yields the initial object', async () => {
  const obj = mutationIterator();
  obj.name = 'test';

  setTimeout(() => {
    finish(obj);
  }, 100);

  let last;
  for await (const { name } of obj) {
    last = name;
  }

  assert.equal(last, 'test');
});

test('Yields a mutated object', async () => {
  const obj = mutationIterator();
  obj.name = 'test';

  setTimeout(() => {
    obj.name = 'change';
    Promise.resolve().then(() => finish(obj));
  }, 100);

  let last;
  let count = 0;
  for await (const { name } of obj) {
    last = name;
    count++;
  }

  assert.equal(last, 'change');
  assert.equal(count, 2);
});

test('Batches changes', async () => {
  const obj = mutationIterator();
  obj.name = 'test';

  setTimeout(() => {
    obj.name = 'change';
    obj.name = 'changed again';
    Promise.resolve().then(() => finish(obj));
  }, 100);

  let last;
  let count = 0;

  for await (const { name } of obj) {
    last = name;
    count++;
  }

  assert.equal(last, 'changed again');
  assert.equal(count, 2);
});

test('Extends a target object', async () => {
  const target = {
    existing: 10
  };
  const obj = mutationIterator(target);
  obj.existing += 1;

  setTimeout(() => {
    finish(obj);
  }, 100);

  let last;
  for await (const { existing } of obj) {
    last = existing;
  }

  assert.equal(last, 11);
});

test('Yields a mutated nested object', async () => {
  const obj = mutationIterator();
  obj.nested = {};

  setTimeout(() => {
    obj.nested = {
      name: 'change'
    };
    Promise.resolve().then(() => finish(obj));
  }, 100);

  let last;
  let count = 0;
  for await (const { nested } of obj) {
    last = nested;
    count++;
  }

  assert.deepEqual(last, {
    name: 'change'
  });
  assert.equal(count, 2);
});

async function test(name, func) {
  console.info(name); // eslint-disable-line
  await func();
}
