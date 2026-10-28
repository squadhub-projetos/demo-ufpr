"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DOCUMENTS_CHANGE_EVENT,
  loadDocuments,
  resolveDocuments,
  type DefaultDocuments,
  type DocumentType,
  type StoredDocument,
} from "./documents";

// Os arquivos padrão são detectados no servidor e repassados aos componentes por contexto.
const DefaultDocumentsContext = createContext<DefaultDocuments>({});

export function DefaultDocumentsProvider({ defaults, children }: { defaults: DefaultDocuments; children: ReactNode }) {
  return <DefaultDocumentsContext value={defaults}>{children}</DefaultDocumentsContext>;
}

export function useDefaultDocuments() {
  return useContext(DefaultDocumentsContext);
}

type SavedDocuments = { documents: StoredDocument[]; urls: Partial<Record<DocumentType, string>> };

// Documentos salvos no IndexedDB com URLs temporárias (blob:), atualizados a cada novo salvamento.
function useSavedDocuments() {
  const [saved, setSaved] = useState<SavedDocuments>({ documents: [], urls: {} });

  useEffect(() => {
    let active: string[] = [];
    let cancelled = false;

    async function refresh() {
      const documents = await loadDocuments().catch(() => []);
      if (cancelled) return;
      active.forEach((url) => URL.revokeObjectURL(url));
      const urls: SavedDocuments["urls"] = {};
      for (const doc of documents) urls[doc.type] = URL.createObjectURL(doc.file);
      active = Object.values(urls);
      setSaved({ documents, urls });
    }

    refresh();
    window.addEventListener(DOCUMENTS_CHANGE_EVENT, refresh);
    return () => {
      cancelled = true;
      window.removeEventListener(DOCUMENTS_CHANGE_EVENT, refresh);
      active.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  return saved;
}

export type DocumentLink = { source: "custom" | "default"; url: string };

// Link de cada documento do menu, já aplicando a prioridade personalizado > padrão.
export function useDocumentLinks() {
  const defaults = useDefaultDocuments();
  const { documents, urls } = useSavedDocuments();
  const resolved = resolveDocuments(documents, defaults);

  const links = {} as Record<DocumentType, DocumentLink | null>;
  for (const [type, doc] of Object.entries(resolved) as [DocumentType, (typeof resolved)[DocumentType]][]) {
    const url = doc?.source === "custom" ? urls[type] : doc?.url;
    links[type] = doc && url ? { source: doc.source, url } : null;
  }
  return links;
}
