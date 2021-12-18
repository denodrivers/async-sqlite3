import { Value } from "./bindings/bindings.ts";

const cache = new WeakMap();
const decodeCache = new WeakMap();

export function encode(params: any[]): Uint8Array {
  if (cache.has({ params })) {
    return cache.get({ params });
  }
  const len = params.length;
  const u8 = new Uint8Array(100);
  const view = new DataView(u8.buffer);

  view.setUint8(0, len);
  let offset = 1;

  for (let i = 0; i < len; i++) {
    if (params[i] == null) {
      view.setUint8(offset, 0x00);
    }
    if (typeof params[i] == "string") {
      view.setUint8(offset, 0x03);

      // @ts-ignore
      const b = Deno.core.encode(params[i]);

      view.setUint32(offset + 1, b.byteLength);
      u8.set(b, offset + 1 + 4);
      offset += b.byteLength + 1;
    }
    if (typeof params[i] == "number") {
      if (Number.isInteger(params[i])) {
        view.setUint8(offset, 0x01);
      }
    }

    offset++;
  }

  cache.set({ params }, u8);
  return u8;
}

const decode =
  // @ts-ignore
  Deno.core?.decode ||
  (new TextDecoder()).decode;

export function decodeArray(encoded: Uint8Array): any[][] {
  if (cache.has(encoded)) {
    return cache.get(encoded);
  }

  const rows = [];
  const view = new DataView(encoded.buffer);
  let offset = 0;
  while (true) {
    if (offset >= encoded.byteLength) break;

    const entry = [];
    const len = view.getUint32(offset);
    offset += 4;

    const row = encoded.slice(offset, offset + len);
    offset += len;
    const rowView = new DataView(row.buffer);
    let rowOffset = 0;
    while (rowOffset < row.byteLength) {
      const type = row[rowOffset];

      rowOffset++;
      if (type == 0x00) {
        entry.push(null);
      }
      if (type == 0x01) {
        entry.push(rowView.getInt32(rowOffset));
        rowOffset += 4;
      }
      if (type == 0x02) {
        entry.push(rowView.getFloat64(rowOffset));
        rowOffset += 8;
      }
      if (type == 0x03) {
        const len = rowView.getUint32(rowOffset);
        rowOffset += 4;
        entry.push(decode(row.slice(rowOffset, rowOffset + len)));
        rowOffset += len;
      }
    }

    rows.push(entry);
  }

  decodeCache.set(encoded, rows);

  return rows;
}
