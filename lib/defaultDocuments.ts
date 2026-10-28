import { closeSync, openSync, readdirSync, readSync, statSync } from "node:fs";
import path from "node:path";
import {
  DEFAULT_DOCUMENT_EXTENSIONS,
  DEFAULT_DOCUMENTS_DIR,
  documentTypes,
  type DefaultDocuments,
} from "./documents";

// Somente servidor: lê public/documentos-padrao/ no build (ou a cada requisição em dev).

const signatures: Record<(typeof DEFAULT_DOCUMENT_EXTENSIONS)[number], number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  jpg: [0xff, 0xd8, 0xff],
  jpeg: [0xff, 0xd8, 0xff],
  png: [0x89, 0x50, 0x4e, 0x47],
};

// Confere o conteúdo real para não exibir arquivos vazios ou com extensão trocada.
function hasSignature(filePath: string, expected: number[]) {
  const buffer = Buffer.alloc(expected.length);
  const fd = openSync(filePath, "r");
  try {
    readSync(fd, buffer, 0, expected.length, 0);
  } finally {
    closeSync(fd);
  }
  return expected.every((byte, i) => buffer[i] === byte);
}

export function getDefaultDocuments(): DefaultDocuments {
  const dir = path.join(process.cwd(), "public", DEFAULT_DOCUMENTS_DIR);
  let names: Set<string>;
  try {
    // Comparação exata de nomes: a Vercel diferencia maiúsculas de minúsculas.
    names = new Set(readdirSync(dir));
  } catch {
    return {};
  }

  const defaults: DefaultDocuments = {};
  for (const doc of documentTypes) {
    for (const ext of DEFAULT_DOCUMENT_EXTENSIONS) {
      const name = `${doc.defaultFile}.${ext}`;
      if (!names.has(name)) continue;
      const filePath = path.join(dir, name);
      try {
        const { size } = statSync(filePath);
        if (size === 0 || !hasSignature(filePath, signatures[ext])) continue;
        defaults[doc.id] = { name, url: `/${DEFAULT_DOCUMENTS_DIR}/${name}`, size };
        break;
      } catch {
        // Arquivo ilegível: segue para a próxima extensão.
      }
    }
  }
  return defaults;
}
