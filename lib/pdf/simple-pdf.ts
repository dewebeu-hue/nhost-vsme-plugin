import "server-only";

import { existsSync, readFileSync } from "fs";
import path from "path";

type TextChunk = {
  indent?: number;
  size?: number;
  text: string;
  variant?: "body" | "footer" | "heading" | "metric" | "muted" | "note" | "rule" | "subtitle" | "title";
  weight?: "bold" | "normal";
};

type PdfPage = {
  lines: TextChunk[];
};

type PdfOptions = {
  footerLabel?: string;
};

type PdfFont = {
  ascent: number;
  bbox: [number, number, number, number];
  capHeight: number;
  cidToGlyph: Map<number, number>;
  descent: number;
  file: Buffer;
  name: string;
  unitsPerEm: number;
  widths: number[];
};

type PdfObject = string | Buffer;

const pageWidth = 595.28;
const pageHeight = 841.89;
const marginX = 46;
const marginTop = 42;
const footerHeight = 34;
const lineGap = 3;
const defaultFontSize = 9.5;
const defaultMaxLineLength = 94;
const minPdfSizeBytes = 8_000;
const rendererName = "embedded_noto_sans_type0";

const regularFontPath = path.join(process.cwd(), "public", "fonts", "NotoSans-Regular.ttf");
const boldFontPath = path.join(process.cwd(), "public", "fonts", "NotoSans-Bold.ttf");

let cachedFonts: { bold: PdfFont; regular: PdfFont } | null = null;

export function createTextPdf(title: string, chunks: TextChunk[], options: PdfOptions = {}) {
  const fonts = loadPdfFonts();
  const pages = paginate(chunks);
  const usedCids = collectUsedCids(title, pages, options);
  const objects: PdfObject[] = [];
  const pageObjectIds: number[] = [];

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = "<< /Type /Pages /Kids [] /Count 0 >>";
  addFontObjects(objects, fonts.regular, 3, 5, 6, 7, 8, 13, usedCids);
  addFontObjects(objects, fonts.bold, 4, 9, 10, 11, 12, 14, usedCids);

  for (const page of pages) {
    const content = createPageContent(page, pages.length, pageObjectIds.length + 1, options);
    const contentId = objects.length + 2;
    const pageId = objects.length + 1;

    pageObjectIds.push(pageId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(`<< /Length ${Buffer.byteLength(content, "utf8")} >>\nstream\n${content}\nendstream`);
  }

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  const pdf = buildPdf(objects, title);

  if (pdf.length < minPdfSizeBytes) {
    throw new Error(`pdf_blank_guard: generated PDF buffer is too small (${pdf.length} bytes)`);
  }

  return pdf;
}

export function getPdfRendererName() {
  return rendererName;
}

export function arePdfFontsAvailable() {
  return existsSync(regularFontPath) && existsSync(boldFontPath);
}

function loadPdfFonts() {
  if (cachedFonts) {
    return cachedFonts;
  }

  cachedFonts = {
    regular: loadPdfFont("NotoSans-Regular", regularFontPath),
    bold: loadPdfFont("NotoSans-Bold", boldFontPath),
  };

  return cachedFonts;
}

function loadPdfFont(name: string, filePath: string): PdfFont {
  if (!existsSync(filePath)) {
    throw new Error(`pdf_font_load: missing font file ${path.basename(filePath)}`);
  }

  const file = readFileSync(filePath);
  const tables = readTableDirectory(file);
  const head = getTable(tables, "head");
  const hhea = getTable(tables, "hhea");
  const hmtx = getTable(tables, "hmtx");
  const maxp = getTable(tables, "maxp");
  const cmap = getTable(tables, "cmap");
  const unitsPerEm = readUInt16(file, head.offset + 18);
  const bbox: [number, number, number, number] = [
    readInt16(file, head.offset + 36),
    readInt16(file, head.offset + 38),
    readInt16(file, head.offset + 40),
    readInt16(file, head.offset + 42),
  ];
  const ascent = readInt16(file, hhea.offset + 4);
  const descent = readInt16(file, hhea.offset + 6);
  const numberOfHMetrics = readUInt16(file, hhea.offset + 34);
  const numGlyphs = readUInt16(file, maxp.offset + 4);

  return {
    ascent,
    bbox,
    capHeight: Math.round(ascent * 0.7),
    cidToGlyph: readCmap(file, cmap.offset),
    descent,
    file,
    name,
    unitsPerEm,
    widths: readGlyphWidths(file, hmtx.offset, numberOfHMetrics, numGlyphs, unitsPerEm),
  };
}

function addFontObjects(
  objects: PdfObject[],
  font: PdfFont,
  type0Id: number,
  cidFontId: number,
  descriptorId: number,
  fontFileId: number,
  toUnicodeId: number,
  cidToGidMapId: number,
  usedCids: Set<number>,
) {
  const glyphMap = createCidToGidMap(font, usedCids);

  objects[cidToGidMapId - 1] = createStreamObject(glyphMap);
  objects[type0Id - 1] =
    `<< /Type /Font /Subtype /Type0 /BaseFont /${font.name} /Encoding /Identity-H /DescendantFonts [${cidFontId} 0 R] /ToUnicode ${toUnicodeId} 0 R >>`;
  objects[cidFontId - 1] =
    `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${font.name} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${descriptorId} 0 R /DW 500 /W ${createWidthArray(font, usedCids)} /CIDToGIDMap ${cidToGidMapId} 0 R >>`;
  objects[descriptorId - 1] =
    `<< /Type /FontDescriptor /FontName /${font.name} /Flags 32 /FontBBox [${font.bbox.map(scaleFontUnit).join(" ")}] /ItalicAngle 0 /Ascent ${scaleFontUnit(font.ascent)} /Descent ${scaleFontUnit(font.descent)} /CapHeight ${scaleFontUnit(font.capHeight)} /StemV 80 /FontFile2 ${fontFileId} 0 R >>`;
  objects[fontFileId - 1] = createStreamObject(font.file, `/Length1 ${font.file.length}`);
  objects[toUnicodeId - 1] = createStreamObject(Buffer.from(createToUnicodeCMap(usedCids), "utf8"));
}

function paginate(chunks: TextChunk[]) {
  const pages: PdfPage[] = [];
  let current: PdfPage = { lines: [] };
  let usedHeight = 0;
  const availableHeight = pageHeight - marginTop - footerHeight;

  for (const chunk of chunks.flatMap(expandChunk)) {
    const neededHeight = getChunkHeight(chunk);

    if (usedHeight + neededHeight > availableHeight && current.lines.length > 0) {
      pages.push(current);
      current = { lines: [] };
      usedHeight = 0;
    }

    current.lines.push(chunk);
    usedHeight += neededHeight;
  }

  if (current.lines.length || !pages.length) {
    pages.push(current);
  }

  return pages;
}

function expandChunk(chunk: TextChunk) {
  if (chunk.variant === "rule") {
    return [{ ...chunk, text: "" }];
  }

  if (!normalizePdfText(chunk.text).trim()) {
    return [{ ...chunk, text: " " }];
  }

  return wrapText(chunk.text, getWrapWidth(chunk)).map((text) => ({ ...chunk, text }));
}

function wrapText(value: unknown, width: number) {
  const words = normalizePdfText(value).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const next = line ? `${line} ${word}` : word;

    if (next.length > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }

  if (line) {
    lines.push(line);
  }

  return lines.length ? lines : [""];
}

function createPageContent(page: PdfPage, totalPages: number, pageNumber: number, options: PdfOptions) {
  const commands: string[] = [];
  let y = pageHeight - marginTop;

  for (const line of page.lines) {
    if (line.variant === "rule") {
      y -= 4;
      commands.push("0.74 0.78 0.82 RG");
      commands.push("0.8 w");
      commands.push(`${marginX} ${y.toFixed(2)} m ${pageWidth - marginX} ${y.toFixed(2)} l S`);
      y -= 8;
      continue;
    }

    const font = line.weight === "bold" || isBoldVariant(line.variant) ? "F2" : "F1";
    const size = line.size ?? getFontSize(line.variant);
    const x = marginX + (line.indent ?? 0);

    commands.push("BT");
    commands.push(getTextColor(line.variant));
    commands.push(`/${font} ${size} Tf`);
    commands.push(`${x} ${y.toFixed(2)} Td`);
    commands.push(`<${encodePdfText(line.text)}> Tj`);
    commands.push("ET");
    y -= getChunkHeight(line);
  }

  addFooter(commands, totalPages, pageNumber, options.footerLabel);

  return commands.join("\n");
}

function addFooter(commands: string[], totalPages: number, pageNumber: number, footerLabel = "Supplier Passport draft") {
  const y = 26;
  const footer = `${normalizePdfText(footerLabel)} | Page ${pageNumber} / ${totalPages}`;

  commands.push("0.74 0.78 0.82 RG");
  commands.push("0.6 w");
  commands.push(`${marginX} 38 m ${pageWidth - marginX} 38 l S`);
  commands.push("BT");
  commands.push("0.45 0.49 0.55 rg");
  commands.push("/F1 8 Tf");
  commands.push(`${marginX} ${y} Td`);
  commands.push(`<${encodePdfText(footer)}> Tj`);
  commands.push("ET");
}

function collectUsedCids(title: string, pages: PdfPage[], options: PdfOptions) {
  const cids = new Set<number>();

  addTextCids(cids, title);

  pages.forEach((page, pageIndex) => {
    page.lines.forEach((line) => addTextCids(cids, line.text));
    addTextCids(cids, `${options.footerLabel ?? "Supplier Passport draft"} | Page ${pageIndex + 1} / ${pages.length}`);
  });

  return cids;
}

function addTextCids(cids: Set<number>, value: unknown) {
  for (const codePoint of normalizePdfText(value)) {
    const cid = codePoint.codePointAt(0) ?? 0x3f;
    cids.add(cid <= 0xffff ? cid : 0x3f);
  }
}

function encodePdfText(value: unknown) {
  const bytes: number[] = [];

  for (const codePoint of normalizePdfText(value)) {
    const cid = codePoint.codePointAt(0) ?? 0x3f;
    const safeCid = cid <= 0xffff ? cid : 0x3f;
    bytes.push((safeCid >> 8) & 0xff, safeCid & 0xff);
  }

  return Buffer.from(bytes).toString("hex").toUpperCase();
}

function getChunkHeight(chunk: TextChunk) {
  if (chunk.variant === "rule") {
    return 12;
  }

  return getFontSize(chunk.variant) + getExtraGap(chunk.variant);
}

function getFontSize(variant: TextChunk["variant"]) {
  switch (variant) {
    case "title":
      return 20;
    case "subtitle":
      return 13;
    case "heading":
      return 12;
    case "metric":
      return 10.5;
    case "footer":
    case "muted":
      return 8.5;
    case "note":
      return 9;
    default:
      return defaultFontSize;
  }
}

function getExtraGap(variant: TextChunk["variant"]) {
  switch (variant) {
    case "title":
      return 9;
    case "subtitle":
      return 8;
    case "heading":
      return 8;
    case "metric":
      return 5;
    case "note":
      return 4;
    case "muted":
      return 3;
    case "footer":
      return 2;
    default:
      return lineGap;
  }
}

function getWrapWidth(chunk: TextChunk) {
  const indent = chunk.indent ?? 0;
  const adjusted = defaultMaxLineLength - Math.round(indent / 7);

  if (chunk.variant === "title") {
    return Math.max(42, adjusted - 30);
  }

  if (chunk.variant === "subtitle" || chunk.variant === "heading") {
    return Math.max(58, adjusted - 16);
  }

  return Math.max(54, adjusted);
}

function isBoldVariant(variant: TextChunk["variant"]) {
  return variant === "heading" || variant === "metric" || variant === "subtitle" || variant === "title";
}

function getTextColor(variant: TextChunk["variant"]) {
  switch (variant) {
    case "muted":
    case "footer":
      return "0.42 0.46 0.52 rg";
    case "note":
      return "0.28 0.32 0.38 rg";
    case "heading":
    case "subtitle":
    case "title":
      return "0.08 0.12 0.18 rg";
    default:
      return "0.16 0.18 0.22 rg";
  }
}

function buildPdf(objects: PdfObject[], title: string) {
  const chunks: Buffer[] = [Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary")];
  const offsets: number[] = [];

  objects.forEach((object, index) => {
    offsets.push(bufferLength(chunks));
    chunks.push(Buffer.from(`${index + 1} 0 obj\n`, "utf8"));
    chunks.push(Buffer.isBuffer(object) ? object : Buffer.from(object, "utf8"));
    chunks.push(Buffer.from("\nendobj\n", "utf8"));
  });

  const xrefOffset = bufferLength(chunks);
  chunks.push(Buffer.from(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`, "utf8"));
  chunks.push(Buffer.from(offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join(""), "utf8"));
  chunks.push(
    Buffer.from(
      `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title (${escapePdfString(normalizePdfText(title))}) >> >>\nstartxref\n${xrefOffset}\n%%EOF`,
      "utf8",
    ),
  );

  return Buffer.concat(chunks);
}

function bufferLength(buffers: Buffer[]) {
  return buffers.reduce((total, buffer) => total + buffer.length, 0);
}

function createStreamObject(content: Buffer, extraDictionary = "") {
  const extra = extraDictionary ? ` ${extraDictionary}` : "";

  return Buffer.concat([
    Buffer.from(`<< /Length ${content.length}${extra} >>\nstream\n`, "utf8"),
    content,
    Buffer.from("\nendstream", "utf8"),
  ]);
}

function readTableDirectory(file: Buffer) {
  const numTables = readUInt16(file, 4);
  const tables = new Map<string, { length: number; offset: number }>();

  for (let index = 0; index < numTables; index += 1) {
    const offset = 12 + index * 16;
    const tag = file.subarray(offset, offset + 4).toString("ascii");
    tables.set(tag, {
      offset: readUInt32(file, offset + 8),
      length: readUInt32(file, offset + 12),
    });
  }

  return tables;
}

function getTable(tables: Map<string, { length: number; offset: number }>, tag: string) {
  const table = tables.get(tag);

  if (!table) {
    throw new Error(`pdf_font_parse: missing ${tag} table`);
  }

  return table;
}

function readCmap(file: Buffer, cmapOffset: number) {
  const tableCount = readUInt16(file, cmapOffset + 2);
  let format12Offset: number | null = null;
  let format4Offset: number | null = null;

  for (let index = 0; index < tableCount; index += 1) {
    const recordOffset = cmapOffset + 4 + index * 8;
    const platformId = readUInt16(file, recordOffset);
    const encodingId = readUInt16(file, recordOffset + 2);
    const subtableOffset = cmapOffset + readUInt32(file, recordOffset + 4);
    const format = readUInt16(file, subtableOffset);

    if (format === 12 && platformId === 3 && encodingId === 10) {
      format12Offset = subtableOffset;
    } else if (format === 4 && platformId === 3 && (encodingId === 1 || encodingId === 0)) {
      format4Offset = subtableOffset;
    }
  }

  if (format12Offset !== null) {
    return readCmapFormat12(file, format12Offset);
  }

  if (format4Offset !== null) {
    return readCmapFormat4(file, format4Offset);
  }

  throw new Error("pdf_font_parse: no supported cmap table");
}

function readCmapFormat12(file: Buffer, offset: number) {
  const groups = readUInt32(file, offset + 12);
  const map = new Map<number, number>();

  for (let index = 0; index < groups; index += 1) {
    const groupOffset = offset + 16 + index * 12;
    const startCharCode = readUInt32(file, groupOffset);
    const endCharCode = readUInt32(file, groupOffset + 4);
    const startGlyphId = readUInt32(file, groupOffset + 8);

    for (let codePoint = startCharCode; codePoint <= endCharCode && codePoint <= 0xffff; codePoint += 1) {
      map.set(codePoint, startGlyphId + codePoint - startCharCode);
    }
  }

  return map;
}

function readCmapFormat4(file: Buffer, offset: number) {
  const segCount = readUInt16(file, offset + 6) / 2;
  const endCodeOffset = offset + 14;
  const startCodeOffset = endCodeOffset + segCount * 2 + 2;
  const idDeltaOffset = startCodeOffset + segCount * 2;
  const idRangeOffsetOffset = idDeltaOffset + segCount * 2;
  const map = new Map<number, number>();

  for (let index = 0; index < segCount; index += 1) {
    const endCode = readUInt16(file, endCodeOffset + index * 2);
    const startCode = readUInt16(file, startCodeOffset + index * 2);
    const idDelta = readUInt16(file, idDeltaOffset + index * 2);
    const idRangeOffsetAddress = idRangeOffsetOffset + index * 2;
    const idRangeOffset = readUInt16(file, idRangeOffsetAddress);

    if (startCode === 0xffff && endCode === 0xffff) {
      continue;
    }

    for (let codePoint = startCode; codePoint <= endCode; codePoint += 1) {
      let glyphId = 0;

      if (idRangeOffset === 0) {
        glyphId = (codePoint + idDelta) & 0xffff;
      } else {
        const glyphOffset = idRangeOffsetAddress + idRangeOffset + (codePoint - startCode) * 2;
        glyphId = readUInt16(file, glyphOffset);

        if (glyphId !== 0) {
          glyphId = (glyphId + idDelta) & 0xffff;
        }
      }

      map.set(codePoint, glyphId);
    }
  }

  return map;
}

function readGlyphWidths(file: Buffer, hmtxOffset: number, numberOfHMetrics: number, numGlyphs: number, unitsPerEm: number) {
  const widths: number[] = [];
  let lastAdvanceWidth = 500;

  for (let glyphId = 0; glyphId < numGlyphs; glyphId += 1) {
    if (glyphId < numberOfHMetrics) {
      lastAdvanceWidth = readUInt16(file, hmtxOffset + glyphId * 4);
    }

    widths[glyphId] = Math.round((lastAdvanceWidth / unitsPerEm) * 1000);
  }

  return widths;
}

function createCidToGidMap(font: PdfFont, usedCids: Set<number>) {
  const maxCid = Math.max(...usedCids, 0);
  const map = Buffer.alloc((maxCid + 1) * 2);

  for (const cid of usedCids) {
    const glyphId = font.cidToGlyph.get(cid) ?? 0;
    map.writeUInt16BE(glyphId, cid * 2);
  }

  return map;
}

function createWidthArray(font: PdfFont, usedCids: Set<number>) {
  const widths = [...usedCids]
    .sort((a, b) => a - b)
    .map((cid) => {
      const glyphId = font.cidToGlyph.get(cid) ?? 0;
      const width = font.widths[glyphId] ?? 500;

      return `${cid} [${width}]`;
    });

  return `[${widths.join(" ")}]`;
}

function createToUnicodeCMap(usedCids: Set<number>) {
  const entries = [...usedCids].sort((a, b) => a - b);
  const chunks: string[] = [];

  for (let index = 0; index < entries.length; index += 100) {
    const group = entries.slice(index, index + 100);
    chunks.push(`${group.length} beginbfchar`);
    group.forEach((cid) => {
      chunks.push(`<${toHexCode(cid)}> <${toUnicodeHex(cid)}>`);
    });
    chunks.push("endbfchar");
  }

  return [
    "/CIDInit /ProcSet findresource begin",
    "12 dict begin",
    "begincmap",
    "/CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> def",
    "/CMapName /Adobe-Identity-UCS def",
    "/CMapType 2 def",
    "1 begincodespacerange",
    "<0000> <FFFF>",
    "endcodespacerange",
    ...chunks,
    "endcmap",
    "CMapName currentdict /CMap defineresource pop",
    "end",
    "end",
  ].join("\n");
}

function toHexCode(value: number) {
  return value.toString(16).toUpperCase().padStart(4, "0");
}

function toUnicodeHex(value: number) {
  return Buffer.from(String.fromCodePoint(value), "utf16le").swap16().toString("hex").toUpperCase();
}

function scaleFontUnit(value: number) {
  return Math.round(value);
}

// PDF text must use embedded Unicode fonts. Do not use Helvetica/WinAnsi or ASCII normalization because Croatian diacritics require Unicode rendering.
function normalizePdfText(value: unknown): string {
  if (value == null) {
    return "";
  }

  return String(value).normalize("NFC");
}

function escapePdfString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function readUInt16(buffer: Buffer, offset: number) {
  return buffer.readUInt16BE(offset);
}

function readInt16(buffer: Buffer, offset: number) {
  return buffer.readInt16BE(offset);
}

function readUInt32(buffer: Buffer, offset: number) {
  return buffer.readUInt32BE(offset);
}
