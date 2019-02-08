# data_walk

check and set default value for you value that not sure!

## installation

```sh
npm install data_walk
```

## usage

```ts
import { $walk, $typeCheck } from 'data_walk';
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

| name       | type                                                                                                               | example                                                                                                                                                                                                                                        |
| :--------- | :----------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| $walk      | <T>(validate: (value: T) => boolean \| any[] \| string) => (value: T) => boolean                                   | $walk($checkType("string"))("hahaha")                                                                                                                                                                                                          |
| $const     | (value1: any) => (value: any) => true \| string                                                                    | $const("haha")("hahaha") <br> <font color="red"> const required&nbsp;haha <br>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;got &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;hahaha</font>                            |
| $typeCheck | (type: string) => (value: any) => string \| int \| float ....                                                      | $typeCheck("string")(1)<br> <font color="red"> type check require string &nbsp;haha <br>  &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;got  value&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1<br> type number</font> |
| $array     | (validateArray: any[]) => (array: any[]) => boolean \| string \| any[]                                             | $array([$typeCheck("string")])(["haha"])                                                                                                                                                                                                       |
| $object    | (validateObj: any) => (obj: any) => boolean \| string \| any[]                                                     | $object({hahah: $typeCheck("string")})({hahah: "haha"})                                                                                                                                                                                        |
| $oneOf     | (...typeArray: any[]) => (value: T) => boolean \| string \| any[]                                                  | $oneOf($const("lalala"), $const("nanana"))("asdf")                                                                                                                                                                                             |
| $optional  | (func: (value: T) => boolean \| string \| any[]) => (value: T) => boolean \| string \| any[]                       | $optional($const("dd"))("dd")                                                                                                                                                                                                                  |
| $validate  | (func: (value: T) => boolean) => (value: T) =>                                                                     | $validate($const("haha"))("hahah") => boolean \| string \| any[]                                                                                                                                                                               |
| $test      | (errorMessage: string, func: (value: T) => boolean \| string \| any[]) => (value: T) => boolean \| string \| any[] | $test("test it tobe lt 1", const("hahaha"))("hahah")                                                                                                                                                                                           |
| $every     | (...funcArray: Array<(value: any) => boolean \| any[] \| string>) => (value: any) => boolean \| string \| any[]    | $every($typeCheck("int"), $validate(gt(10)), $validate(lt(100)))                                                                                                                                                                               |

