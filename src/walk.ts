import { equal, get, hasOwnProperty, map, typeOf } from 'little_bit';
import { $parse, $stringify } from './helper';

const getCertainPathValidateObject = (validateObject: any, path: Array<string | number>): any => {
  // 到具体地址的时候， 如果里面有不知数量的array， children有3种类型， 一种是array， map, 然后是function
  // 查看validateObject 中的 children 是function还是 array 和 map
  if (path.length > 0 && !get(["children", path[0]], validateObject)) {
    throw new Error("don't have such path validateObject");
  }
  if (path.length === 0) {
    return validateObject;
  }
  return getCertainPathValidateObject(get(["children", path[0]], validateObject), path.slice(1));
}

const validate = (validateObject: any, value: any) => {
  // 如果里面有validate 则将
  // 这里需要提供错误信息
  if (hasOwnProperty(validateObject, "validate")) {
    const result = validateObject.validate(value);
    const children = get(["children"], validateObject);
    switch (true) {
      case result && children !== undefined && typeOf(children) === "array":
        return children.reduce((tempResult, certainChildren) => { }, true);
    }
  }
}

const $walk = (validateObject: any) => (path: Array<string | number>, value: any) => {
  // 如果validate 中不存在children 的话， 这条线就结束了, 否则
  const certainPathValidateObject = getCertainPathValidateObject(validateObject, path);

  if (typeOf(validate) !== 'function' && equal(validate, value)) {
    return true;
  }
  if (typeOf(validate) !== 'function' && !equal(validate, value)) {
    console.error('static value error: not equal to the static value');
    return false;
  }
  const result = validate(value);
  switch (true) {
    case result === true:
      return true;

    case typeOf(result) === 'symbol' && typeOf($parse(result)) === 'string':
      console.error($parse(result));
      return false;

    case typeOf(result) === 'symbol' && typeOf($parse(result)) === 'array':
      // console.error错误结果
      // get the path
      // get the errorMessage
      // 如果最后一个是object
      const parseResult = $parse(result);
      const errorMessage = (parseResult as any[])[(parseResult as any[]).length - 1];
      const path = (parseResult as any[]).slice(0, (parseResult as any[]).length - 1);
      console.error(`path: ${path}\n errorMessage: ${errorMessage}`);
      return false;

    default:
      console.error('validate failure');
      return false;
  }
  // 如果返回一个string; 直接console.error
  // 如果返回一个array; console.error 出一个基本结构
  // else return the boolean;
};

export default $walk;
