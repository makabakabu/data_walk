import { compose, equal, fill, intersection, range, size, typeOf, Xor } from 'little_bit';

const $stringify = (value: string | any[]) => Symbol(JSON.stringify({ type: typeOf(value), value }));
const $parse = (symbol: symbol) => {
  // if the type
  const str = symbol.toString(); /*?*/
  const obj = JSON.parse(str.slice(7, str.length - 1) /*?*/);
  if (
    $object({
      type: $oneOf('string', 'array'),
      value: $oneOf($typeCheck('string'), $typeCheck('array')),
    })(obj) === true
  ) {
    return obj.value; // 数据格式正确
  } else {
    return 'custom function error: need to return boolean'; // 说明数据格式不对
  }
};

const $typeCheck = (type: string) => (value: any) => {
  const error = $stringify(`type check require ${type}\n got value: ${value.toString()} type: ${typeOf(value)}`);
  switch (type) {
    case 'int':
      return (typeOf(value) === 'number' && /-?\\d+$/.test(value)) || error;

    case 'float':
      return (typeOf(value) === 'number' && !/-?\\d+$/.test(value)) || error;

    case 'any':
      return true;

    default:
      return typeOf(value) === type ? true : error; // 分开 int 和 float;
  }
};

// 查看validateArray 是否每一个都是提供的方法。。。
const $array = (validateArray: any | any[], everyElementUseSameValidate: boolean = false) => (array: any[]) => {
  // 如果validateArray 不是 array 并且 everyElementUseSameValidate 是false 则显示错误信息
  // 如果validateArray 是 array 并且 everyElementUseSameValidate 是true 则显示错误信息
  if (
    (typeOf(validateArray) !== 'array' && everyElementUseSameValidate === false) ||
    (typeOf(validateArray) === 'array' && everyElementUseSameValidate === true)
  ) {
    return $stringify('parameter error');
  }
  if (everyElementUseSameValidate === true) {
    validateArray = fill([], array.length, validateArray);
  }
  if (array.length !== validateArray.length) {
    return $stringify(`array require length ${validateArray.length}\n array got length ${array.length}`);
  }
  for (const index of range(array.length)) {
    // if the validArray is not a function than just equal it
    // if it is a function than get the result
    if (typeOf(validateArray[index]) !== 'function' && !equal(validateArray[index], array[index])) {
      return $stringify('static value error: not equal to the static value');
    }
    if (typeOf(validateArray[index]) !== 'function' && equal(validateArray[index], array[index])) {
      continue;
    }
    const result = validateArray[index](array[index]);
    switch (true) {
      case result === true:
        break;

      case result === false:
        return $stringify('array validate failure');

      case typeOf(result) === 'symbol' && typeOf($parse(result)) === 'string':
        return $stringify([index, $parse(result)]);

      case typeOf(result) === 'symbol' && typeOf($parse(result)) === 'array':
        return $stringify([index, ...$parse(result)]);

      default:
        return $stringify('custom function error: need to return boolean');
    }
    return true;
  }
};

// 如果遇到string, [{ path: key, errorMessage: string}]
const $object = (validateObj: any) => (obj: any) => {
  if (size(obj) !== size(validateObj) || !equal(Object.keys(obj), Object.keys(validateObj))) {
    // alert the missing key
    const missingKey = compose(
      intersection,
      (intersectionArray: string[]) => Xor(Object.keys(validateObj), intersectionArray),
    )(Object.keys(validateObj), Object.keys(obj));
    return $stringify(`object keys not equal, missingKey: ${missingKey.toString()}`);
  }
  for (const key of Object.keys(obj)) {
    if (typeOf(validateObj[key]) !== 'function' && !equal(validateObj[key], obj[key])) {
      return $stringify('static value error: not equal to the static value');
    }
    if (typeOf(validateObj[key]) !== 'function' && equal(validateObj[key], obj[key])) {
      continue;
    }
    const result = validateObj[key](obj[key]);
    switch (true) {
      case result === true:
        break;

      case result === false:
        return $stringify('object validate failure');

      case typeOf(result) === 'symbol' && typeOf($parse(result)) === 'string':
        return $stringify([key, $parse(result)]);

      case typeOf(result) === 'symbol' && typeOf($parse(result)) === 'array':
        return $stringify([key, ...$parse(result)]);

      default:
        return $stringify('custom function error: need to return boolean');
    }
  }
  return true;
};
// 需要定制错误信息
const $oneOf = (...typeArray: any[]) => (value: any) => {
  for (const typeFunction of typeArray) {
    if (
      (typeOf(typeFunction) !== 'function' && equal(typeFunction, value)) ||
      (typeOf(typeFunction) === 'function' && typeFunction(value) === true)
    ) {
      return true;
    } else {
      continue;
    }
  }
  return $stringify('oneOf function error: not one matched');
};

// 增加常量
const $optional = (func?: any) => (value: any) => {
  if (value === undefined || (typeOf(func) !== 'function' && equal(func, value))) {
    return true;
  }
  if (typeOf(func) !== 'function' && !equal(func, value)) {
    return $stringify('static value error: not equal to the static value');
  }
  const result = func(value);
  switch (true) {
    case result === true:
      return true;

    case result === false:
      return $stringify('optional validate failure');

    case typeOf(result) === 'symbol':
      return $stringify($parse(result));

    default:
      return $stringify('custom function error: need to return boolean');
  }
};

// replace the default error message
const $test = (errorMessage: string, func: any) => (value: any) => {
  if (typeOf(func) !== 'function' && equal(func, value)) {
    return true;
  }
  if (typeOf(func) !== 'function' && !equal(func, value)) {
    return $stringify(errorMessage);
  }
  return func(value) === true || $stringify(errorMessage);
};
// 特殊对待optional, arrayDescription, oneOf
// test
// helperFunction lt, gt, regex 由用户自己提供, compose
// error function
// if it is not a function, need to equal it, if it is a function, you need to pass it into the function to validate it.
// if it is object then compare every one of the value, no less and no more.
const $every = (...funcArray: any[]) => (value: any) => {
  for (const func of funcArray) {
    if ((typeOf(func) !== 'function' && equal(func, value)) || (typeOf(func) === 'function' && func(value) === true)) {
      continue;
    } else {
      $stringify('every error: function not equal');
    }
  }
  return true;
};

export { $typeCheck, $optional, $every, $object, $array, $oneOf, $test, $stringify, $parse };
