import { FileText, House, User, type LucideIcon } from "lucide-react";
import { documentTypes, type DocumentType } from "./documents";

// Itens sem `href` são apenas visuais (sem ação ao clicar).
export type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: { label: string; documentType: DocumentType }[];
};

export const navItems: NavItem[] = [
  { label: "Início", icon: House, href: "/" },
  { label: "Meus Dados Pessoais", icon: User, href: "/dados-pessoais" },
  {
    label: "Documentos",
    icon: FileText,
    children: documentTypes.map((d) => ({ label: d.label, documentType: d.id })),
  },
];

export const UNAVAILABLE_HINT = "Funcionalidade indisponível";
export const MISSING_DOCUMENT_HINT = "Documento ainda não anexado. Envie-o em Meus Dados Pessoais.";
