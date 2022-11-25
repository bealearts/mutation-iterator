# mutation-iterator

Creates an object which is a an async iterator which yields when any of its properties are mutated

# Install
```shell
npm i mutation-iterator
```

# Usage

```js
import mutationIterator, { finish } from 'mutation-iterator';

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
```