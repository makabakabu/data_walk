import { compose, equal, intersection, range, size, typeOf, Xor } from 'little_bit';

type IOutput = boolean | string | any[];
function $const(value1: any) {
  return (value: any) => equal(value1, value) || `const require ${value1.toString()}\n got ${value.toString()}`;
}

function $typeCheck(type: string) {
  return (value: any) => {
    switch (type) {
      case 'int':
        return typeOf(value) === 'number' && /-?\\d+$/.test(value);

      case 'float':
        return typeOf(value) === 'number' && !/-?\\d+$/.test(value);

      case 'any':
        return true;

      default:
        return typeOf(value) === type
          ? true
          : `type check require ${type}\n got value: ${value.toString()} type: ${typeOf(value)}`; // 分开 int 和 float;
    }
  };
}

// 查看validateArray 是否每一个都是提供的方法。。。
function $array(validateArray: any[]) {
  return (array: any[]) => {
    if (array.length !== validateArray.length) {
      return `array require length ${validateArray.length}\n array got length ${array.length}`;
    }
    for (const index of range(array.length)) {
      // 如果不对， 则报错
      let result;
      const testIsWalkFunction = $testIsWalkFunction(validateArray[index]);
      if (testIsWalkFunction === true) {
        result = validateArray[index](array[index]);
      } else {
        return testIsWalkFunction;
      }
      switch (typeOf(result)) {
        case 'array':
          return [index, ...result];

        case 'string':
          return [index, { path: index, errorMessage: result }];

        default:
          break;
      }
    }
    return true;
  };
}

// 如果遇到string, [{ path: key, errorMessage: string}]
function $object(validateObj: any) {
  return (obj: any) => {
    if (size(obj) !== size(validateObj) || !equal(Object.keys(obj), Object.keys(validateObj))) {
      // alert the missing key
      const missingKey = compose(
        intersection,
        (intersectionArray: string[]) => Xor(Object.keys(validateObj), intersectionArray),
      )(Object.keys(validateObj), Object.keys(obj));
      return `object keys not equal, missingKey: ${missingKey.toString()}`;
    }
    for (const key of Object.keys(obj)) {
      let result;
      const testIsWalkFunction = $testIsWalkFunction(validateObj[key]);
      if (testIsWalkFunction === true) {
        result = validateObj[key](obj[key]);
      } else {
        return testIsWalkFunction;
      }
      switch (typeOf(result)) {
        case 'array':
          return [key, ...result];

        case 'string':
          return [key, { path: key, errorMessage: result }];

        default:
          break;
      }
    }
    return true;
  };
}
// 需要定制错误信息
function $oneOf<T>(...typeArray: any[]) {
  return (value: T) => {
    for (const typeFunction of typeArray) {
      // 如果不对， 则报错
      const testIsWalkFunction = $testIsWalkFunction(typeFunction);
      if (testIsWalkFunction !== true) {
        return testIsWalkFunction;
      }
      if (typeFunction(value) !== true) {
        return typeFunction(value);
      }
    }
    return true;
  };
}

// 增加常量
function $optional<T>(func: (value: T) => IOutput) {
  return (value: T) =>
    value === undefined ||
    (() => ($testIsWalkFunction(func) === true ? false : $testIsWalkFunction(func)))() ||
    func(value);
}

function $validate<T>(func: (value: T) => boolean) {
  return (value: T) => func(value) === true || 'validate failure';
}

// replace the default error message
function $test<T>(errorMessage: string, func: (value: T) => IOutput) {
  return (value: T) =>
    (() => ($testIsWalkFunction(func) === true ? false : $testIsWalkFunction(func)))() ||
    func(value) === true ||
    errorMessage;
}
// 特殊对待optional, arrayDescription, oneOf
// test
// helperFunction lt, gt, regex 由用户自己提供, compose
// error function
// if it is not a function, need to equal it, if it is a function, you need to pass it into the function to validate it.
// if it is object then compare every one of the value, no less and no more.
function $every(...funcArray: Array<(value: any) => boolean | any[] | string>) {
  return (value: any) => {
    for (const func of funcArray) {
      if ($testIsWalkFunction(func) !== true) {
        return $testIsWalkFunction(func);
      }
      if (func(value) !== true) {
        return func(value);
      }
    }
    return true;
  };
}
$const.isWalkFunction = true;
$typeCheck.isWalkFunction = true;
$optional.isWalkFunction = true;
$object.isWalkFunction = true;
$array.isWalkFunction = true;
$oneOf.isWalkFunction = true;
$test.isWalkFunction = true;
$every.isWalkFunction = true;
$validate.isWalkFunction = true;
const $testIsWalkFunction = (func: any) =>
  (typeOf(func) === 'function' && func.isWalkFunction) || 'cannot use the outside function';
export { $const, $typeCheck, $optional, $object, $array, $oneOf, $test, $every, $testIsWalkFunction, $validate };
// 现在只剩下如何呈现错误信息了。
