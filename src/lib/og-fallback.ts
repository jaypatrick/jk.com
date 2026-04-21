const PNG_SIGNATURE = Uint8Array.from([137, 80, 78, 71, 13, 10, 26, 10]);
const FALLBACK_WIDTH = 1200;
const FALLBACK_HEIGHT = 630;
const FALLBACK_RGB = Uint8Array.from([0x05, 0x05, 0x0a]);
const CRC32_POLYNOMIAL = 0xedb88320;

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let crc = i;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc & 1) === 1 ? (crc >>> 1) ^ CRC32_POLYNOMIAL : crc >>> 1;
    }
    table[i] = crc >>> 0;
  }
  return table;
})();

const concatBytes = (chunks: Uint8Array[]): Uint8Array => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
};

const uint32ToBytes = (value: number): Uint8Array => {
  const bytes = new Uint8Array(4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, value);
  return bytes;
};

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = (crc >>> 8) ^ crc32Table[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const createChunk = (type: 'IHDR' | 'IDAT' | 'IEND', data: Uint8Array): Uint8Array => {
  const typeBytes = new TextEncoder().encode(type);
  const crcInput = concatBytes([typeBytes, data]);
  return concatBytes([
    uint32ToBytes(data.byteLength),
    typeBytes,
    data,
    uint32ToBytes(crc32(crcInput)),
  ]);
};

const createIhdrData = (): Uint8Array => {
  const ihdrData = new Uint8Array(13);
  const view = new DataView(ihdrData.buffer);
  view.setUint32(0, FALLBACK_WIDTH);
  view.setUint32(4, FALLBACK_HEIGHT);
  ihdrData[8] = 8;
  ihdrData[9] = 2;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  return ihdrData;
};

const createRawScanlineData = (): Uint8Array => {
  const rowLength = 1 + FALLBACK_WIDTH * 3;
  const rowData = new Uint8Array(rowLength);
  for (let offset = 1; offset < rowLength; offset += 3) {
    rowData.set(FALLBACK_RGB, offset);
  }

  const rawScanlineData = new Uint8Array(FALLBACK_HEIGHT * rowLength);
  for (let row = 0; row < FALLBACK_HEIGHT; row += 1) {
    rawScanlineData.set(rowData, row * rowLength);
  }
  return rawScanlineData;
};

const compressDeflateRaw = async (data: Uint8Array): Promise<Uint8Array> => {
  const blobData = Uint8Array.from(data);
  const compressed = await new Response(
    new Blob([blobData]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  ).arrayBuffer();
  return new Uint8Array(compressed);
};

export async function generateFallbackOgPng(): Promise<Uint8Array> {
  const ihdrData = createIhdrData();
  const idatData = await compressDeflateRaw(createRawScanlineData());

  return concatBytes([
    PNG_SIGNATURE,
    createChunk('IHDR', ihdrData),
    createChunk('IDAT', idatData),
    createChunk('IEND', new Uint8Array(0)),
  ]);
}
