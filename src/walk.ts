import { equal, typeOf } from 'little_bit';
import { $parse, $stringify } from './helper';

const $walk = (validate: any) => (value: any) => {
  // 如果validate 返回一个路径, 则表示false
  // 首先测试下是否是walkFunction
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
