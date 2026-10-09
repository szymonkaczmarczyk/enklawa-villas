import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import ffmpeg from 'ffmpeg-static';
import opentype from 'opentype.js';
import sharp from 'sharp';

const palette = {
  basalt: '#121316',
  travertine: '#E5DFD7',
  shade: '#B9AC98',
  oak: '#B49A7C',
};

const loadFont = (file) => {
  const buffer = readFileSync(`node_modules/@fontsource/${file}`);
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
};

const sansFamily = (weight) => [
  loadFont(`dm-sans/files/dm-sans-latin-${weight}-normal.woff`),
  loadFont(`dm-sans/files/dm-sans-latin-ext-${weight}-normal.woff`),
];

const fonts = {
  serif: [loadFont('cinzel/files/cinzel-latin-400-normal.woff')],
  light: sansFamily(300),
  regular: sansFamily(400),
  semibold: sansFamily(600),
};

const capRatio = (family) => family[0].tables.os2.sCapHeight / family[0].unitsPerEm;

const round = (value) => Number(value.toFixed(2));

function pathData(path) {
  return path.commands
    .map((command) => {
      if (command.type === 'Z') return 'Z';
      if (command.type === 'Q') return `Q${round(command.x1)} ${round(command.y1)} ${round(command.x)} ${round(command.y)}`;
      if (command.type === 'C') {
        return `C${round(command.x1)} ${round(command.y1)} ${round(command.x2)} ${round(command.y2)} ${round(command.x)} ${round(command.y)}`;
      }
      return `${command.type}${round(command.x)} ${round(command.y)}`;
    })
    .join('');
}

function shapeText(family, text, { x = 0, baseline = 0, fontSize, tracking = 0 }) {
  const path = new opentype.Path();
  let cursor = 0;
  let previous = null;
  for (const char of text) {
    const font = family.find((candidate) => candidate.charToGlyphIndex(char) > 0) ?? family[0];
    const glyph = font.charToGlyph(char);
    const scale = fontSize / font.unitsPerEm;
    if (previous?.font === font) cursor += font.getKerningValue(previous.glyph, glyph) * scale;
    path.extend(glyph.getPath(x + cursor, baseline, fontSize));
    cursor += glyph.advanceWidth * scale + tracking * fontSize;
    previous = { font, glyph };
  }
  return path;
}

function fitText(family, text, { capHeight, width }) {
  const fontSize = capHeight / capRatio(family);
  const natural = shapeText(family, text, { fontSize }).getBoundingBox();
  const tracking = (width - (natural.x2 - natural.x1)) / ((text.length - 1) * fontSize);
  return { fontSize, tracking };
}

function placeText(family, text, { capHeight, width, centerX, capTop }) {
  const { fontSize, tracking } = fitText(family, text, { capHeight, width });
  const box = shapeText(family, text, { fontSize, tracking }).getBoundingBox();
  const x = centerX - (box.x1 + box.x2) / 2;
  return pathData(shapeText(family, text, { x, baseline: capTop + capHeight, fontSize, tracking }));
}

const mark = { width: 343, height: 462 };

const pillar = {
  face: 'M0 0H160V25H0ZM38 52H92V411H38ZM18 411H92V435H18ZM0 435H92V441H0Z',
  shade: 'M17 25H160V52H17ZM92 52H95L147 89V407L161 411H92ZM92 411H161V435H92ZM0 441H92V435H160V462H0Z',
};
const handle = 'M147 204H161V258H147Z';

function markGroup(fills, transform = '') {
  const mirrored = `matrix(-1 0 0 1 ${mark.width} 0)`;
  return `<g${transform ? ` transform="${transform}"` : ''}>`
    + `<path ${fills.face} d="${pillar.face}"/>`
    + `<path ${fills.shade} d="${pillar.shade}${handle}"/>`
    + `<g transform="${mirrored}"><path ${fills.face} d="${pillar.face}"/><path ${fills.shade} d="${pillar.shade}"/></g>`
    + '</g>';
}

const wordmark = {
  stacked: {
    width: 700,
    height: 718,
    markX: 179,
    enklawa: { capHeight: 92, width: 701, centerX: 350, capTop: 536 },
    villas: { capHeight: 47, width: 319, centerX: 350, capTop: 671 },
  },
  horizontal: {
    width: 1758,
    height: 462,
    markX: 0,
    enklawa: { capHeight: 170, width: 1295, centerX: 1110.5, capTop: 62 },
    villas: { capHeight: 86, width: 589, centerX: 1110.5, capTop: 313 },
  },
};

function logoSvg(variant, fills, extra = '') {
  if (variant === 'mark') {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${mark.width} ${mark.height}"${extra}>${markGroup(fills)}</svg>`;
  }
  const spec = wordmark[variant];
  const enklawa = placeText(fonts.serif, 'ENKLAWA', spec.enklawa);
  const villas = placeText(fonts.light, 'VILLAS', spec.villas);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${spec.width} ${spec.height}"${extra}>`
    + markGroup(fills, spec.markX ? `translate(${spec.markX} 0)` : '')
    + `<path ${fills.type} d="${enklawa}${villas}"/>`
    + '</svg>';
}

const themedFills = {
  face: 'fill="currentColor"',
  shade: 'class="logo-shade"',
  type: 'fill="currentColor"',
};

const solidFills = {
  face: `fill="${palette.travertine}"`,
  shade: `fill="${palette.shade}"`,
  type: `fill="${palette.travertine}"`,
};

mkdirSync('src/assets/brand', { recursive: true });
for (const variant of ['horizontal', 'stacked', 'mark']) {
  writeFileSync(`src/assets/brand/logo-${variant}.svg`, logoSvg(variant, themedFills));
}

function iconSvg(size, markShare) {
  const scale = (size * markShare) / mark.height;
  const x = (size - mark.width * scale) / 2;
  const y = (size - mark.height * scale) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">`
    + `<rect width="${size}" height="${size}" fill="${palette.basalt}"/>`
    + markGroup(solidFills, `translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(5)})`)
    + '</svg>';
}

writeFileSync('public/favicon.svg', iconSvg(64, 0.72));

const icoSizes = [16, 32, 48];
const icoImages = await Promise.all(
  icoSizes.map((size) => sharp(Buffer.from(iconSvg(size, size <= 16 ? 0.8 : 0.72))).png().toBuffer()),
);
const header = Buffer.alloc(6 + icoSizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);
let offset = header.length;
icoSizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt8(0, entry + 2);
  header.writeUInt8(0, entry + 3);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(icoImages[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += icoImages[index].length;
});
writeFileSync('public/favicon.ico', Buffer.concat([header, ...icoImages]));

await sharp(Buffer.from(iconSvg(180, 0.62))).png().toFile('public/apple-touch-icon.png');

const ogSource = execFileSync(ffmpeg, [
  '-hide_banner', '-loglevel', 'error',
  '-i', 'videos/intro1.mp4',
  '-vf', 'select=eq(n\\,191)', '-frames:v', '1', '-fps_mode', 'vfr',
  '-f', 'image2pipe', '-vcodec', 'png', '-',
], { maxBuffer: 64 * 1024 * 1024 });

const og = { width: 1200, height: 630, padding: 72 };

const ogVariants = {
  pl: { lines: ['Przestrzeń, której', 'nie da się powtórzyć.'] },
  en: { lines: ['Space that cannot', 'be replicated.'] },
};

const ogLogoHeight = 48;
const ogLogoWidth = (wordmark.horizontal.width / wordmark.horizontal.height) * ogLogoHeight;

mkdirSync('public/og', { recursive: true });
for (const [lang, variant] of Object.entries(ogVariants)) {
  const fontSize = 70;
  const lineHeight = 74;
  const lastBaseline = og.height - og.padding - 52;
  const headline = variant.lines
    .map((line, index) => pathData(shapeText(fonts.semibold, line, {
      x: og.padding,
      baseline: lastBaseline - (variant.lines.length - 1 - index) * lineHeight,
      fontSize,
      tracking: -0.06,
    })))
    .join('');
  const domain = pathData(shapeText(fonts.regular, 'enklawavillas.com', {
    x: og.padding,
    baseline: og.height - og.padding,
    fontSize: 22,
    tracking: -0.02,
  }));

  const overlay = `<svg xmlns="http://www.w3.org/2000/svg" width="${og.width}" height="${og.height}">`
    + '<defs>'
    + `<linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="${palette.basalt}" stop-opacity="0.82"/><stop offset="0.5" stop-color="${palette.basalt}" stop-opacity="0.36"/><stop offset="1" stop-color="${palette.basalt}" stop-opacity="0"/></linearGradient>`
    + `<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0.5" stop-color="${palette.basalt}" stop-opacity="0"/><stop offset="1" stop-color="${palette.basalt}" stop-opacity="0.7"/></linearGradient>`
    + '</defs>'
    + `<rect width="${og.width}" height="${og.height}" fill="url(#side)"/>`
    + `<rect width="${og.width}" height="${og.height}" fill="url(#floor)"/>`
    + logoSvg('horizontal', solidFills, ` x="${og.padding}" y="64" width="${ogLogoWidth.toFixed(1)}" height="${ogLogoHeight}"`)
    + `<path fill="${palette.travertine}" d="${headline}"/>`
    + `<path fill="${palette.oak}" d="${domain}"/>`
    + '</svg>';

  await sharp(ogSource)
    .resize(og.width, og.height, { fit: 'cover', position: 'centre' })
    .composite([{ input: Buffer.from(overlay) }])
    .jpeg({ quality: 86, mozjpeg: true })
    .toFile(`public/og/${lang}.jpg`);
}

console.log('Logo, favicon, apple-touch-icon i obrazy OG gotowe.');
