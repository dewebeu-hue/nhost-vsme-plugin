import "server-only";

type TextChunk = {
  indent?: number;
  size?: number;
  text: string;
  variant?: "body" | "footer" | "heading" | "metric" | "muted" | "note" | "rule" | "subtitle" | "title";
  weight?: "bold" | "normal";
};

export type PdfLogoImage = {
  bytes: Buffer;
  format: "jpeg" | "rgb";
  height: number;
  width: number;
};

type PdfPage = {
  lines: TextChunk[];
};

type PdfOptions = {
  footerLabel?: string;
  logoImage?: PdfLogoImage | null;
};

const pageWidth = 595.28;
const pageHeight = 841.89;
const marginX = 46;
const marginTop = 42;
const footerHeight = 34;
const lineGap = 3;
const defaultFontSize = 9.5;
const defaultMaxLineLength = 94;
// Keep Croatian Latin Extended glyphs explicit. Do not normalize these to ASCII;
// buyer-facing HR PDFs must render č, ć, đ, š, and ž correctly.
const customGlyphCodes = new Map<string, number>([
  ["\u010D", 128],
  ["\u010C", 129],
  ["\u0107", 130],
  ["\u0106", 131],
  ["\u0111", 132],
  ["\u0110", 133],
  ["\u0161", 134],
  ["\u0160", 135],
  ["\u017E", 136],
  ["\u017D", 137],
]);

const latinExtendedEncoding = "<< /Type /Encoding /BaseEncoding /WinAnsiEncoding /Differences [128 /ccaron /Ccaron /cacute /Cacute /dcroat /Dcroat /scaron /Scaron /zcaron /Zcaron] >>";


export function createTextPdf(title: string, chunks: TextChunk[], options: PdfOptions = {}) {
  const pages = paginate(chunks);
  const objects: string[] = [];
  const pageObjectIds: number[] = [];
  const fontNormalId = 3;
  const fontBoldId = 4;
  const logoObjectId = options.logoImage ? 5 : null;

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("<< /Type /Pages /Kids [] /Count 0 >>");
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding ${latinExtendedEncoding} >>`);
  objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding ${latinExtendedEncoding} >>`);

  if (options.logoImage && logoObjectId) {
    objects.push(createJpegImageObject(options.logoImage));
  }

  for (const page of pages) {
    const content = createPageContent(page, pages.length, pageObjectIds.length + 1, options);
    const contentId = objects.length + 2;
    const pageId = objects.length + 1;
    const xObjectResources = logoObjectId ? ` /XObject << /Logo ${logoObjectId} 0 R >>` : "";

    pageObjectIds.push(pageId);
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontNormalId} 0 R /F2 ${fontBoldId} 0 R >>${xObjectResources} >> /Contents ${contentId} 0 R >>`,
    );
    objects.push(`<< /Length ${Buffer.byteLength(content, "binary")} >>\nstream\n${content}\nendstream`);
  }

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`;

  return Buffer.from(buildPdf(objects, title), "binary");
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

  if (!chunk.text.trim()) {
    return [{ ...chunk, text: " " }];
  }

  return wrapText(chunk.text, getWrapWidth(chunk)).map((text) => ({ ...chunk, text }));
}

function wrapText(value: string, width: number) {
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

  if (pageNumber === 1 && options.logoImage) {
    addLogo(commands, options.logoImage);
  }

  for (const line of page.lines) {
    if (line.variant === "rule") {
      y -= 4;
      commands.push("0.74 0.78 0.82 RG");
      commands.push("0.8 w");
      commands.push(`${marginX} ${y.toFixed(2)} m ${pageWidth - marginX} ${y.toFixed(2)} l S`);
      y -= 16;
      continue;
    }

    const font = line.weight === "bold" || isBoldVariant(line.variant) ? "F2" : "F1";
    const size = line.size ?? getFontSize(line.variant);
    const x = marginX + (line.indent ?? 0);

    const text = normalizePdfText(line.text);

    commands.push("BT");
    commands.push(getTextColor(line.variant));
    commands.push(`/${font} ${size} Tf`);
    commands.push(`${x} ${y.toFixed(2)} Td`);
    commands.push(`<${encodePdfHexString(text)}> Tj`);
    commands.push("ET");
    y -= getChunkHeight(line);
  }

  addFooter(commands, totalPages, pageNumber, options.footerLabel);

  return commands.join("\n");
}

function addLogo(commands: string[], image: PdfLogoImage) {
  const maxWidth = 96;
  const maxHeight = 48;
  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = image.width * scale;
  const height = image.height * scale;
  const x = pageWidth - marginX - width;
  const y = pageHeight - marginTop - height + 4;

  commands.push("q");
  commands.push(`${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm`);
  commands.push("/Logo Do");
  commands.push("Q");
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
  commands.push(`<${encodePdfHexString(footer)}> Tj`);
  commands.push("ET");
}

function getChunkHeight(chunk: TextChunk) {
  if (chunk.variant === "rule") {
    return 20;
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

function buildPdf(objects: string[], title: string) {
  const offsets: number[] = [];
  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "binary");
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info << /Title ${createPdfInfoString(title)} >> >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

function createJpegImageObject(image: PdfLogoImage) {
  const filter = image.format === "jpeg" ? "/DCTDecode" : "/FlateDecode";

  return [
    `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height}`,
    `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter ${filter}`,
    `/Length ${image.bytes.length} >>`,
    "stream",
    image.bytes.toString("binary"),
    "endstream",
  ].join("\n");
}

function normalizePdfText(value: unknown) {
  if (value == null) {
    return "";
  }

  return String(value)
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\u2082/g, "2")
    .replace(/\u00A0/g, " ")
    .normalize("NFC");
}

function encodePdfHexString(value: string) {
  return Buffer.from(encodePdfBytes(value)).toString("hex").toUpperCase();
}

function encodePdfBytes(value: string) {
  const bytes: number[] = [];

  for (const character of Array.from(normalizePdfText(value))) {
    const customCode = customGlyphCodes.get(character);

    if (customCode) {
      bytes.push(customCode);
      continue;
    }

    const code = character.charCodeAt(0);

    if ((code >= 32 && code <= 126) || (code >= 160 && code <= 255)) {
      bytes.push(code);
      continue;
    }

    bytes.push(63);
  }

  return bytes;
}

function createPdfInfoString(value: string) {
  const encoded = Buffer.from(`\uFEFF${normalizePdfText(value)}`, "utf16le");

  for (let index = 0; index < encoded.length; index += 2) {
    const first = encoded[index];
    encoded[index] = encoded[index + 1] ?? 0;
    encoded[index + 1] = first ?? 0;
  }

  return `<${encoded.toString("hex").toUpperCase()}>`;
}
