import { test, expect } from 'vitest';

import mutationIterator, { finish } from './mutation-iterator.js';

test('Allows setting props', async () => {
  const obj = mutationIterator();
  obj.name = 'test';
  expect(obj).toEqual({
    name: 'test'
  });
});

test('Does not yields the initial object', async () => {
  const obj = mutationIterator();
  obj.name = 'test';

  setTimeout(() => {
    finish(obj);
  }, 100);

  let last;
  for await (const { name } of obj) {
    last = name;
  }

  expect(last).toEqual(undefined);
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

  expect(last).toEqual('change');
  expect(count).toEqual(1);
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

  expect(last).toEqual('changed again');
  expect(count).toEqual(1);
});

test('Extends a target object', async () => {
  const target = {
    existing: 10
  };
  const obj = mutationIterator(target);

  setTimeout(() => {
    obj.existing += 1;

    Promise.resolve().then(() => finish(obj));
  }, 100);

  let last;
  for await (const { existing } of obj) {
    last = existing;
  }

  expect(last).toEqual(11);
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

  expect(last).toEqual({
    name: 'change'
  });
  expect(count).toEqual(1);
});
