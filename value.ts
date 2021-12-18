import { Value } from "./bindings/bindings.ts";

const cache = new WeakMap();

export const Null = "null";
export const Text = (text: string) => {
  return { text: { text } };
};
export const Integer = (integer: number) => {
  return { integer: { integer } };
};
export const Real = (real: number) => {
  return { real: { real } };
};

export function fromValue(value: Value): any {
  if (value == Null) return null;
  if (value.text?.text) return value.text.text;
  if (value.integer?.integer) return value.integer.integer;
  if (value.real?.real) return value.real.real;

  throw new TypeError("unreachable");
}

function _intoValue(value: any): Value {
  if (typeof value == "string") {
    return Text(value);
  }

  if (typeof value == "number") {
    if (Number.isInteger(value)) {
      return Integer(value);
    } else {
      return Real(value);
    }
  }

  if (typeof value == "boolean") {
    return Integer(value ? 1 : 0);
  }

  if (value === null) return Null;

  if (value instanceof RegExp) {
    return Text(value.toString());
  }

  if (value instanceof Date) {
    return Real(value.getTime());
  }

  throw new TypeError("Type not supported");
}

export function intoValue(value: any): Value {
  if (cache.has({ value })) {
    return cache.get({ value });
  }

  const ser = _intoValue(value);

  cache.set({ value }, ser);

  return ser;
}
