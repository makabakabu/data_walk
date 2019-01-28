function $symbol(string) {
  return Symbol(`Symbol(${string})`);
}

$symbol.valueOf = function() {
  return Symbol("symbol");
};

module.exports = {
  $undefined: Symbol("undefined"),
  $null: Symbol("null"),
  $symbol,
  $string: Symbol("string"),
  $number: Symbol("number"),
  $boolean: Symbol("boolean"),
  $promise: Symbol("promise"),
  $function: Symbol("function"),
  $array: Symbol("array"),
  $object: Symbol("object"),
  $any: Symbol("any"),
  $optional: Symbol("optional"),
  $arrayDescription: Symbol("arrayDescription"),
  $oneOf: Symbol("oneOf")
};

// Object.fromEntries(['foo', 'bar'], ['baz', 42]);
// caveat: can't use valueOf function
