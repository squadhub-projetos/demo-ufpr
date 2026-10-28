"use client";

import { useRef, type ChangeEvent } from "react";
import { FileText, RotateCcw, Upload, X } from "lucide-react";
import {
  documentTypes,
  type DefaultDocuments,
  type DocumentType,
  type ResolvedDocument,
} from "@/lib/documents";

type FileUploadProps = {
  id: string;
  documents: Record<DocumentType, ResolvedDocument | null>;
  defaults: DefaultDocuments;
  maxFiles: number;
  error?: string;
  onAdd: (files: File[], target?: DocumentType) => void;
  onChangeType: (from: DocumentType, to: DocumentType) => void;
  onRemove: (type: DocumentType) => void;
};

const ACCEPT = ".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png";

const iconButton =
  "shrink-0 rounded-[3px] p-[3px] text-[#999] transition-colors focus-visible:outline-2 focus-visible:outline-siga-accent";

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

function openInNewTab(file: File) {
  const url = URL.createObjectURL(file);
  window.open(url, "_blank", "noopener");
  // A nova aba já carregou o arquivo; libera a memória depois de um tempo.
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

function SourceBadge({ source }: { source: ResolvedDocument["source"] }) {
  const custom = source === "custom";
  return (
    <span
      className={`shrink-0 rounded-[3px] border px-[5px] text-[12px] leading-[18px] ${
        custom ? "border-siga-accent/40 text-siga-accent" : "border-field-border text-[#999]"
      }`}
    >
      {custom ? "Personalizado" : "Padrão"}
    </span>
  );
}

export function FileUpload({ id, documents, defaults, maxFiles, error, onAdd, onChangeType, onRemove }: FileUploadProps) {
  const replaceInput = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<DocumentType>(null);
  const rows = documentTypes.flatMap((d) => documents[d.id] ?? []);
  const customCount = rows.filter((doc) => doc.source === "custom").length;

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onAdd(Array.from(event.target.files ?? []));
    // Permite selecionar o mesmo arquivo novamente após removê-lo.
    event.target.value = "";
  }

  function handleReplace(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file && replaceTarget.current) onAdd([file], replaceTarget.current);
    event.target.value = "";
  }

  // Abre o seletor de arquivos já vinculado ao documento padrão que será substituído.
  function replace(type: DocumentType) {
    replaceTarget.current = type;
    replaceInput.current?.click();
  }

  return (
    <div className="mb-[15px]">
      <p className="mb-[5px] mt-[10px] text-[14px] font-bold text-siga-text">Anexos</p>
      <div className="flex flex-wrap items-center gap-[10px]">
        <input
          id={id}
          type="file"
          multiple
          accept={ACCEPT}
          onChange={handleChange}
          aria-describedby={`${id}-help`}
          className="peer sr-only"
        />
        <label
          htmlFor={id}
          className="inline-flex cursor-pointer select-none items-center gap-[5px] rounded-[3px] border border-[#ddd] bg-[#f4f4f4] px-3 py-[6px] text-[14px] text-[#444] transition-[background-color,box-shadow,transform] duration-100 hover:bg-[#e7e7e7] active:translate-y-px active:bg-[#dcdcdc] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-siga-accent"
        >
          <Upload className="h-[14px] w-[14px]" strokeWidth={2.5} aria-hidden="true" />
          Selecionar arquivo
        </label>
        <span className="text-[14px] text-siga-muted">
          {customCount === 0
            ? "Nenhum arquivo selecionado"
            : `${customCount} arquivo${customCount > 1 ? "s" : ""} selecionado${customCount > 1 ? "s" : ""}`}
        </span>
        <input
          ref={replaceInput}
          type="file"
          accept={ACCEPT}
          onChange={handleReplace}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only"
        />
      </div>

      {error ? (
        <p id={`${id}-help`} role="alert" className="mt-[5px] text-[13px] text-field-error">
          {error}
        </p>
      ) : (
        <p id={`${id}-help`} className="mt-2 text-[14px] text-siga-help">
          Formatos aceitos: PDF, JPG ou PNG, até 5 MB por arquivo (máximo de {maxFiles} arquivos). Cada anexo fica disponível no menu Documentos.
        </p>
      )}

      {rows.length > 0 && (
        <ul className="mt-[10px] max-w-[640px] border border-field-border">
          {rows.map((doc) => {
            const label = documentTypes.find((d) => d.id === doc.type)?.label ?? doc.type;
            return (
              <li
                key={`${doc.type}-${doc.source}-${doc.name}`}
                className="flex flex-wrap items-center gap-[8px] border-b border-field-border px-3 py-[7px] text-[14px] text-siga-muted last:border-b-0"
              >
                <FileText className="h-[15px] w-[15px] shrink-0 text-siga-accent" aria-hidden="true" />
                {doc.source === "custom" ? (
                  <button
                    type="button"
                    onClick={() => openInNewTab(doc.file)}
                    title={`Abrir ${doc.name} em nova aba`}
                    className="min-w-0 flex-1 truncate text-left text-siga-accent hover:underline active:text-[#2a6a90] focus-visible:outline-2 focus-visible:outline-siga-accent"
                  >
                    {doc.name}
                  </button>
                ) : (
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Abrir ${doc.name} em nova aba`}
                    className="min-w-0 flex-1 truncate text-siga-accent hover:underline active:text-[#2a6a90] focus-visible:outline-2 focus-visible:outline-siga-accent"
                  >
                    {doc.name}
                  </a>
                )}
                <SourceBadge source={doc.source} />
                <span className="shrink-0 text-[13px]">{formatSize(doc.size)}</span>
                {doc.source === "custom" ? (
                  <>
                    <select
                      value={doc.type}
                      onChange={(e) => onChangeType(doc.type, e.target.value as DocumentType)}
                      aria-label={`Documento correspondente a ${doc.name}`}
                      className="h-[28px] max-w-full shrink-0 border border-field-border bg-white px-2 text-[13px] text-siga-muted outline-none focus:border-siga-accent"
                    >
                      {documentTypes.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                    {defaults[doc.type] ? (
                      <button
                        type="button"
                        onClick={() => onRemove(doc.type)}
                        aria-label={`Restaurar arquivo padrão de ${label}`}
                        title="Restaurar arquivo padrão"
                        className={`${iconButton} hover:bg-[#e7e7e7] hover:text-siga-accent active:bg-[#dcdcdc]`}
                      >
                        <RotateCcw className="h-[14px] w-[14px]" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onRemove(doc.type)}
                        aria-label={`Remover ${doc.name}`}
                        className={`${iconButton} hover:bg-[#f2dede] hover:text-field-error active:bg-[#ebccd1]`}
                      >
                        <X className="h-[14px] w-[14px]" strokeWidth={2.5} aria-hidden="true" />
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <span className="h-[28px] max-w-full shrink-0 truncate px-2 text-[13px] leading-[28px]">{label}</span>
                    <button
                      type="button"
                      onClick={() => replace(doc.type)}
                      aria-label={`Substituir arquivo padrão de ${label}`}
                      title="Substituir por outro arquivo"
                      className={`${iconButton} hover:bg-[#e7e7e7] hover:text-siga-accent active:bg-[#dcdcdc]`}
                    >
                      <Upload className="h-[14px] w-[14px]" strokeWidth={2.5} aria-hidden="true" />
                    </button>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
