# Walk

check and set default value for you value that not sure!

## installation

```sh
npm install Walk
```

## usage

```ts
import { $walk, $typeCheck } from 'Walk';
const { $string } = type;
const afterWalk = $walk(
  $object({
    a: $typeCheck('string'),
  }),
)({
  a: 'abc',
}); // { a: "abc" }
```

### check and warn

if it's not the type we want, warn it.

we provide undefined, null, symbol, string, number, boolean,promise, function, array, object

and optional type if you want to skip it

and oneOf type if you want multiple type

you can use custom validation function to validate, but need to put it into test.

ideal Way:

```json
grandparent/parent/children/superJunior:
  set       value: 2;
            type: number;

  required  type: string;
```

将一个数据传入, 然后这个数据通过层层验证

use test("", () => {

}); to replace the default error message

## 最后进行差错提醒, 对可能产生的错误进行预警

\$validate 是唯一的一个可以包着非 walkFunction 的函数
