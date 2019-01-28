# frozen-api

check and set default value for you value that not sure!

## installation

```sh
npm install frozen-api
```

## usage

```js
import frozen from "frozen-api";
const frozenAfter = frozen(
  {
    a: "string"
  },
  {
    a: "abc"
  }
); // { a: "abc" }
```

you want to check the input type when you called by some user or the output type when you call others.

some aspect we want to do about the data;

### check it

if it's not the type we want, undefined it;

we provide undefined, null, symbol, string, number, boolean, promise, function, array, object

and optional type if you want to skip it

and oneOf type if you want multiple type

### setDefaultValue

if it's not the type we want, replace it;

there are several difficulty facing array:
we provide \_\_listFunction\_\_ to overcome it;

Symbol considered to be the most unnecessary type;

use Symbol to represent type undefined, type Symbol or...
