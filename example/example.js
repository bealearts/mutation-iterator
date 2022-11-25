import mutationIterator, { finish } from '../src/mutation-iterator.js';

const obj = mutationIterator();

obj.someProp = 'Initial...';

setTimeout(() => {
  obj.someProp = 'Hello';

  finish(obj);
}, 1000);

console.log(obj.someProp);

for await (const { someProp } of obj) {
  console.log(someProp);
}

console.log('Finished');
