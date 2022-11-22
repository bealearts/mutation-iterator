import mutationIterator from '../src/mutation-iterator.js';

const obj = mutationIterator();



for await ( { name } of obj ) {
  console.log(name);
}