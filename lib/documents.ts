// Documentos exibidos no menu "Documentos"; cada anexo é vinculado a um deles.
// `defaultFiles` lista os nomes aceitos (sem extensão) do arquivo padrão em public/documentos-padrao/,
// em ordem de preferência. Acentos e espaços são permitidos.
export const documentTypes = [
  {
    id: "declaracao-matricula",
    label: "Declaração de Matrícula",
    defaultFiles: ["Declaração de Matrícula", "declaracao-matricula"],
  },
  {
    id: "historico-integralizacao",
    label: "Histórico de Integralização",
    defaultFiles: ["Histórico de Integralização", "historico-integralizacao"],
  },
  {
    id: "registro-academico-ativo",
    label: "Declaração de registro acadêmico ativo",
    defaultFiles: ["Declaração de registro acadêmico ativo", "registro-academico-ativo"],
  },
] as const;

export type DocumentType = (typeof documentTypes)[number]["id"];

export type StoredDocument = { type: DocumentType; file: File };

// Arquivos padrão versionados com o projeto e servidos como estáticos.
export const DEFAULT_DOCUMENTS_DIR = "documentos-padrao";
export const DEFAULT_DOCUMENT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png"] as const;

export type DefaultDocument = { name: string; url: string; size: number };
export type DefaultDocuments = Partial<Record<DocumentType, DefaultDocument>>;

export type ResolvedDocument =
  | { source: "custom"; type: DocumentType; name: string; size: number; file: File }
  | { source: "default"; type: DocumentType; name: string; size: number; url: string };

// Regra única de prioridade: arquivo personalizado > arquivo padrão > indisponível.
export function resolveDocuments(custom: StoredDocument[], defaults: DefaultDocuments) {
  const resolved = {} as Record<DocumentType, ResolvedDocument | null>;
  for (const { id } of documentTypes) {
    const file = custom.find((doc) => doc.type === id)?.file;
    const fallback = defaults[id];
    if (file) resolved[id] = { source: "custom", type: id, name: file.name, size: file.size, file };
    else if (fallback) resolved[id] = { source: "default", type: id, ...fallback };
    else resolved[id] = null;
  }
  return resolved;
}

// Os arquivos ficam no IndexedDB do navegador (demo sem backend).
const DB_NAME = "siga-ufpr";
const STORE = "documentos";
export const DOCUMENTS_CHANGE_EVENT = "siga:documentos-atualizados";

function openDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "type" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadDocuments(): Promise<StoredDocument[]> {
  const db = await openDb();
  try {
    return await new Promise<StoredDocument[]>((resolve, reject) => {
      const request = db.transaction(STORE).objectStore(STORE).getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

// Substitui todos os documentos salvos pela lista atual do formulário.
export async function saveDocuments(documents: StoredDocument[]) {
  const db = await openDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      store.clear();
      for (const doc of documents) store.put(doc);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
  window.dispatchEvent(new Event(DOCUMENTS_CHANGE_EVENT));
}
