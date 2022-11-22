# mutation-iterator

Creates an object which is a an async iterator which yields when any of its properties are mutated

# Install
```shell
npm i mutation-iterator
```

# Usage

```js
import mutationIterator from 'mutation-iterator';

const obj = mutationIterator();



for await ( { name } of obj ) {
  console.log(name);
}

```