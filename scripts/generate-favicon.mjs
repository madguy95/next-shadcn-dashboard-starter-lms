import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <circle cx="128" cy="128" r="128" fill="#2563eb"/>
  <g stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <path d="M64 64a21 21 0 0 1 21 -21h86a21 21 0 0 1 21 21v43a21 21 0 0 1 -21 21h-86a21 21 0 0 1 -21 -21z"/>
    <line x1="128" y1="21" x2="128" y2="43"/>
    <line x1="96"  y1="128" x2="96"  y2="224"/>
    <line x1="160" y1="128" x2="160" y2="224"/>
    <path d="M53 171 l43 -21"/>
    <path d="M160 150 l43 21"/>
    <line x1="96" y1="203" x2="160" y2="203"/>
    <circle cx="107" cy="85" r="4" fill="white" stroke="none"/>
    <circle cx="149" cy="85" r="4" fill="white" stroke="none"/>
  </g>
</svg>`;

const svgBuf = Buffer.from(svg);

async function pngToIco(pngBuffers) {
  const HEADER_SIZE = 6;
  const ENTRY_SIZE = 16;
  const count = pngBuffers.length;
  const headerBuf = Buffer.alloc(HEADER_SIZE + ENTRY_SIZE * count);

  // ICONDIR
  headerBuf.writeUInt16LE(0, 0);     // reserved
  headerBuf.writeUInt16LE(1, 2);     // type: ICO
  headerBuf.writeUInt16LE(count, 4); // count

  let offset = HEADER_SIZE + ENTRY_SIZE * count;
  for (let i = 0; i < count; i++) {
    const png = pngBuffers[i];
    const { width, height } = await sharp(png).metadata();
    const e = HEADER_SIZE + i * ENTRY_SIZE;
    headerBuf.writeUInt8(width >= 256 ? 0 : width, e);
    headerBuf.writeUInt8(height >= 256 ? 0 : height, e + 1);
    headerBuf.writeUInt8(0, e + 2);   // color count
    headerBuf.writeUInt8(0, e + 3);   // reserved
    headerBuf.writeUInt16LE(1, e + 4); // planes
    headerBuf.writeUInt16LE(32, e + 6); // bit count
    headerBuf.writeUInt32LE(png.length, e + 8);
    headerBuf.writeUInt32LE(offset, e + 12);
    offset += png.length;
  }

  return Buffer.concat([headerBuf, ...pngBuffers]);
}

const [png32, png16] = await Promise.all([
  sharp(svgBuf).resize(32, 32).png().toBuffer(),
  sharp(svgBuf).resize(16, 16).png().toBuffer(),
]);

const ico = await pngToIco([png32, png16]);
const out = resolve(__dirname, '../src/app/favicon.ico');
writeFileSync(out, ico);
console.log(`favicon.ico written to ${out} (${ico.length} bytes)`);
