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

## helper Function

| name       | type                                                          | example                                                                                                                                                                                                                  |
| :--------- | :------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| $const     | (value1: any) => (value: any) => true \| string               | $const("haha")("hahaha") <br> <font color="red"> const required&nbsp;haha <br>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;got &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hahaha</font>      |
| $typeCheck | (type: string) => (value: any) => string \| int \| float .... | $typeCheck("string")("hahaha")<br> <font color="red"> const required&nbsp;haha <br>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;got &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hahaha</font> |
