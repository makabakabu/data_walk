const every = (obj, func) => typeOf(obj) === "array" ? obj.every(func) : Object.entries(obj).every(([key, value]) => func(value, key));
const hasOwnProperty = (obj1, obj2) => typeOf(obj1) === "object" && Object.prototype.hasOwnProperty.call(obj1, obj2);
const reduce = (obj, func, initialResult) => typeOf(obj) === "array" ? obj.reduce(func) : Object.entries(obj).reduce((tempResult, [key, value]) => func(tempResult, value, key), initialResult);
const remove = (path, object) => {
    path = convertPath2List(path);
    const lastPath = path[path.length - 1];
    const restPath = path.slice(0, path.length - 1);
    const lastObject = get(restPath, object);
    let value, restObject;
    if (typeOf(lastObject) === "object") {
        ({ [lastPath]: value, ...restObject } = lastObject);
    } else {
        restObject = [...lastObject.slice(0, lastPath), ...lastObject.slice(lastPath + 1)];
    }
    return restPath.length === 0 ? restObject : set(restPath, restObject, object);
};
const convertPath2List = (path) => {
    switch (typeOf(path)) {
        case "string":
        case "number":
            return [path];

        case "array":
            return path;

        default:
            return [];
    }
};
const get = (path, object) => {
    path = convertPath2List(path);
    return path.reduce((certainList, certainPath) => {
        if (hasOwnProperty(certainList, certainPath)) {
            return certainList[certainPath];
        } else {
            throw new Error("don't have the key");
        }
    }, object);
};
const typeOf = (value) => Object.prototype.toString.call(value).replace(/\[|\]/gi, "").split(" ")[1].toLowerCase();
// 如果只想规定某个字段的类型, 不想要规定他的值, 只需要使用 undefined string, number, boolean, symbol, promise function null array object, 此时类型正确即可

// 如果既想控制类型, 又想在类型不正确的时候可以有替换数据, 直接使用替换的数据,由于本身具有类型, 没有问题.

// if you want more access of checking you can use __listFunction__ pass a function to check it. output the checked value

// caveat: if you want use string undefined as the real value of it, you need to use __useTypeAsValue__

// 在很多情况下, 某些参数必须要出现, 但是有时不能够出现,则需要
// 如果 structure 是 undefined 的话, 是用undefined进行填充所有的数据, 还是使用预设的值进行填充
// !预设值需要区分类型和值两种情况...
// if it is list, it is very useful for lock the structure and the type of the data
// support type: string, number, boolean, symbol, promise, function, null, array, object, listFunction
// listFunction used to describe the list.
// ! 不适用于使用object 来初始化的 string, boolean, 等等.
// ! 数组中不可以使用缺省, 如果可以缺省, 则证明不是同一类型数据, 那么可以用object来表示
const frozen = (defaultStructure, structure) => {
    // if it is an object and has few properties:
    // 使用body字段表示内容
    // use __oneOf__: true 来表示之一
    // 由于 有__oneOf__但是没有optional的时候是必须要有的, 所以当没有的时候,会需要设置默认元素, 这时可以用, defaultIndex 来指认缺省值, 若没有defaultIndex, 则使用第一个.
    // use __optional__: true 来表示可选字段
    // 在使用list的时候如果 defaultStructure 和 structure 对不上的时候直接报错, 所以建议对数据的个数不确定的话不要直接使用array
    switch (typeOf(defaultStructure)) {
        case "string": {
            // 如果defaultStructure 为 ["undefined", "null", "symbol", "string", "number", "boolean", "promise", "function", "array", "object"]其中一个, 那么structure必须为相同类型, 不然为undefined,
            // 如果defaultStructure 不是类型数据, 则只需要 structure 为 string 即可
            if (defaultStructure === "any") {
                return structure;
            }
            const isTypeValue = ["undefined", "null", "symbol", "string", "number", "boolean", "promise", "function", "array", "object"].includes(defaultStructure);
            if (isTypeValue && typeOf(structure) === defaultStructure || !isTypeValue && typeOf(structure) === "string"){
                return structure;
            } else {
                console.error("API接口: 不符合预设数据类型");
                return undefined;
            }
        }
        
        case "number":
        case "boolean":
        case "symbol":
        case "null":
        case "promise":
        case "function":
            if (typeOf(structure) === typeOf(defaultStructure)) {
                return structure;
            } else {
                console.error("API接口: 不符合预设数据类型");
                return defaultStructure;
            }

        case "array":
            switch (`${typeOf(structure) === typeOf(defaultStructure)} ${structure.length === defaultStructure.length}`) {
                case "true true":
                    return defaultStructure.map((certainDefaultStructure, index) => frozen(certainDefaultStructure, structure[index]));

                case "true false":
                    console.error("API接口: 数组长度不一致");

                case "false true":
                case "false false":
                    console.error("API接口: 不符合预设数据类型");

                default:
                    break;
            }

        case "object":
            switch (true) {
                case hasOwnProperty(defaultStructure, "__optional__") && typeOf(structure) !== "undefined"/*?*/:
                // if don't have any other property remove use body, but if we has other property then remove it.
                    if (["__oneOf__", "__useTypeAsValue__", "__listFunction__"].some((certainProperty, index) => hasOwnProperty(defaultStructure, certainProperty))) {
                        return frozen(remove("__optional__", defaultStructure), structure);
                    } else {
                        return frozen(defaultStructure["body"], structure);
                    }

                case hasOwnProperty(defaultStructure, "__optional__") && typeOf(structure) === "undefined":
                    return undefined;

                case hasOwnProperty(defaultStructure, "__useTypeAsValue__"):
                    return typeOf(structure) === "string" ? structure : defaultStructure.body;

                case hasOwnProperty(defaultStructure, "__listFunction__"):
                    return frozen(defaultStructure.body(structure)/*?*/, structure);

                case hasOwnProperty(defaultStructure, "__oneOf__"): {
                    if (typeOf(defaultStructure["body"]) !== "array" || defaultStructure["body"]["length"] === 0) {
                        console.error("API接口: oneOf 类型的 body 必须为 array 类型, 而且必须有值");
                        return undefined;
                    }
                    const index= defaultStructure["body"].findIndex((certainDefaultStructure, index) => typeEqual(certainDefaultStructure, structure))/*?*/;
                    switch (true) {
                        case index === -1 && hasOwnProperty(defaultStructure, "__defaultIndex__"):
                            return defaultStructure["body"][defaultStructure["__defaultIndex__"]];
                        case index === -1 && !hasOwnProperty(defaultStructure, "__defaultIndex__"):
                            return undefined;
                        default:
                            return structure;
                    }
                }

                default:
                    return reduce(defaultStructure, (tempResult, certainDefaultStructure, key) => {
                        switch (true) {
                            case hasOwnProperty(certainDefaultStructure, "__optional__") && !hasOwnProperty(structure, key):
                                return tempResult;

                            case !hasOwnProperty(structure, key):
                                return { ...tempResult, [key]: frozen(certainDefaultStructure)};

                            case hasOwnProperty(structure, key):
                                return { ...tempResult, [key]: frozen(certainDefaultStructure, structure[key])};

                            default:
                                break;
                        }
                    }, {});
                    // 如果是object 并且不是optional直接添加到里面, 如果是optional 但是 structure 中没有对应的值, 则
            }
    }
};

const typeEqual = (defaultStructure, structure) => {
    // 判断 structure2 是否符合structure1
    switch (typeOf(defaultStructure)) {
        case "string": {
            // 如果defaultStructure 为 ["undefined", "null", "symbol", "string", "number", "boolean", "promise", "function", "array", "object"]其中一个, 那么structure必须为相同类型, 不然为undefined,
            // 如果defaultStructure 不是类型数据, 则只需要 structure 为 string 即可
            const isTypeValue = ["undefined", "null", "symbol", "string", "number", "boolean", "promise", "function", "array", "object"].includes(defaultStructure);
            return isTypeValue && typeOf(structure) === defaultStructure || !isTypeValue && typeOf(structure) === "string";
        }
        case "number":
        case "boolean":
        case "symbol":
        case "undefined":
        case "null":
        case "promise":
        case "function":
            return typeOf(defaultStructure) === typeOf(structure);

        case "array":
            if (`${typeOf(defaultStructure) === typeOf(structure)} ${defaultStructure.length === structure.length}`) {
                return defaultStructure.every((certainDefaultStructure, index) => typeEqual(certainDefaultStructure, structure[index]));
            } else {
                return false;
            }

        case "object":
            switch (true) {
                case hasOwnProperty(defaultStructure, "__optional__") && typeOf(structure) !== "undefined":
                return typeEqual(remove("__optional__", structure), structure);

                case hasOwnProperty(defaultStructure, "__optional__") && typeOf(structure) === "undefined":
                    return true;

                case hasOwnProperty(defaultStructure, "__useTypeAsValue__"):
                    return typeOf(structure) === "string";

                case hasOwnProperty(defaultStructure, "__listFunction__"):
                    return typeEqual(defaultStructure.body(structure)/*?*/, structure);

                case hasOwnProperty(defaultStructure, "__oneOf__"):
                    return defaultStructure.body.findIndex((certainDefaultStructure, index) => typeEqual(certainDefaultStructure, structure)) !== -1;

                default:
                    return every(defaultStructure, (certainDefaultStructure, key) => {
                        switch (true) {
                            case hasOwnProperty(certainDefaultStructure, "__optional__") && !hasOwnProperty(structure, key):
                                return true;

                            case !hasOwnProperty(structure, key):
                                return typeEqual(certainDefaultStructure);

                            case hasOwnProperty(structure, key):
                                return typeEqual(certainDefaultStructure, structure[key]);

                            default:
                                return false;
                        }
                    });
            }

        default:
            return false;
    }
};

// !TEST
// frozen({
//     abc: "adsf",
//     add: {
//         __useTypeAsValue__: true,
//         body: "string",
//     },
//     hahahah: {
//         __oneOf__: true,
//         body: ["undefined", "null", "string", "number"],
//     },
//     ccc: {
//         __defaultIndex__: 2,
//         __oneOf__: true,
//         __optional__: true,
//         body: ["aaa", "bbb", "ddd"],
//     },
//     ddd: {
//         __listFunction__: true,
//         body: (structure) =>
//         structure.map((value, index) => ({
//             aaa: "Ass",
//             bbb: "asdf",
//             eee: "asfd",
//         }))
//     },
// }, {
//     hahahah: 1,
//     abc: "dsde",
//     add: 1,
//     ccc: null,
//     ddd: [{aaa: "Ass", bbb:"asdfafd", eee: "dfadfasdf"}, "Asdfasfd"],
// }); /*?*/

module.exports = frozen;