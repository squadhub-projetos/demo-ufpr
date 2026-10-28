import { closeSync, openSync, readdirSync, readSync, statSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_DOCUMENT_EXTENSIONS,
  DEFAULT_DOCUMENTS_DIR,
  documentTypes,
  type DefaultDocuments,
} from "./documents";

// Somente servidor: lê public/documentos-padrao/ no build (ou a cada requisição em dev).

type Extension = (typeof DEFAULT_DOCUMENT_EXTENSIONS)[number];

const signatures: Record<Extension, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  jpg: [0xff, 0xd8, 0xff],
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

// O cabeçalho %PDF pode aparecer em qualquer ponto dos primeiros 1024 bytes.
const PDF_HEADER_WINDOW = 1024;

// Confere o conteúdo real para não exibir arquivos vazios ou com extensão trocada.
function hasSignature(filePath: string, ext: Extension) {
  const expected = Buffer.from(signatures[ext]);
  const buffer = Buffer.alloc(ext === "pdf" ? PDF_HEADER_WINDOW : expected.length);
  const fd = openSync(filePath, "r");
  let read: number;
  try {
    read = readSync(fd, buffer, 0, buffer.length, 0);
  } finally {
    closeSync(fd);
  }
  const head = buffer.subarray(0, read);
  return ext === "pdf" ? head.includes(expected) : head.subarray(0, expected.length).equals(expected);
}

export function getDefaultDocuments(): DefaultDocuments {
  const dir = path.join(process.cwd(), "public", DEFAULT_DOCUMENTS_DIR);
  // Nome normalizado (NFC) -> nome real em disco. A comparação diferencia maiúsculas,
  // como a Vercel, mas tolera acentos gravados em NFC ou NFD.
  const names = new Map<string, string>();
  try {
    for (const name of readdirSync(dir)) names.set(name.normalize("NFC"), name);
  } catch {
    return {};
  }

  const defaults: DefaultDocuments = {};
  for (const doc of documentTypes) {
    search: for (const base of doc.defaultFiles) {
      for (const ext of DEFAULT_DOCUMENT_EXTENSIONS) {
        const actual = names.get(`${base}.${ext}`.normalize("NFC"));
        if (!actual) continue;
        const filePath = path.join(dir, actual);
        try {
          const { size } = statSync(filePath);
          if (size === 0 || !hasSignature(filePath, ext)) continue;
          // URL com o nome real codificado (espaços e acentos).
          defaults[doc.id] = { name: actual, url: `/${DEFAULT_DOCUMENTS_DIR}/${encodeURIComponent(actual)}`, size };
          break search;
        } catch {
          // Arquivo ilegível: segue para o próximo candidato.
        }
      }
    }
  }
  return defaults;
}
