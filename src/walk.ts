import { typeOf } from 'little_bit';
import { $testIsWalkFunction } from './helper';

const $walk = <T>(validate: (value: T) => boolean | any[] | string) => (value: T) => {
  // 如果validate 返回一个路径, 则表示false
  // 首先测试下是否是walkFunction
  if ($testIsWalkFunction(validate) !== true) {
    console.error($testIsWalkFunction(validate));
    return false;
  }
  const result = validate(value);
  switch (typeOf(result)) {
    case 'string':
      console.error(result);
      return false;

    case 'array': {
      // console.error错误结果
      // get the path
      // get the errorMessage
      // 如果最后一个是object
      const lastPath = (result as any[])[(result as any[]).length - 1];
      const restPath = (result as any[]).slice(0, (result as any[]).length - 1);
      const path = [restPath, lastPath.path];
      const errorMessage = lastPath.errorMessage;
      console.error(`path: ${path}\n errorMessage: ${errorMessage}`);
      return false;
    }

    case 'boolean':
      return result;

    default:
      return false;
  }
  // 如果返回一个string; 直接console.error
  // 如果返回一个array; console.error 出一个基本结构
  // else return the boolean;
};

export default $walk;
