"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Circle } from "lucide-react";
import { SilhouetteIcon } from "@/components/ui/icons";
import { userProfile } from "@/lib/profile";
import { useDocumentLinks } from "@/lib/documentsClient";
import { MISSING_DOCUMENT_HINT, navItems, type NavItem } from "@/lib/navigation";

type SidebarProps = { className: string; onNavigate: () => void };

const itemBase =
  "flex h-[44px] w-full select-none items-center gap-[10px] border-l-[3px] pl-[14px] pr-[10px] text-left text-[14px] transition-colors duration-100 active:bg-black/35 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-siga-accent";
const itemIdle = "border-transparent text-siga-link hover:border-siga-accent/60 hover:bg-siga-active hover:text-white";
const itemActive = "border-siga-accent bg-siga-active text-white";

const childBase =
  "flex w-full select-none items-start gap-[8px] py-[6px] pl-[20px] pr-[10px] text-left text-[14px] leading-[18px] transition-colors duration-100 hover:bg-white/5 hover:text-white active:bg-black/30 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-siga-accent";

function TreeItem({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  const documentLinks = useDocumentLinks();
  const Icon = item.icon;

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`${itemBase} ${open ? "border-transparent bg-siga-active text-white" : itemIdle}`}
      >
        <Icon className="h-[14px] w-[14px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
        {item.label}
        <ChevronLeft
          className={`ml-auto h-[14px] w-[14px] transition-transform ${open ? "-rotate-90" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul className="bg-[#2c3b41] py-[5px]">
          {item.children?.map((child) => {
            const link = documentLinks[child.documentType];
            const content = (
              <>
                <Circle className="mt-[4px] h-[10px] w-[10px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                {child.label}
              </>
            );
            return (
              <li key={child.label}>
                {link ? (
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Abrir ${child.label} em nova aba${link.source === "default" ? " (arquivo padrão)" : ""}`}
                    className={`${childBase} text-[#b8c7ce]`}
                  >
                    {content}
                  </a>
                ) : (
                  <button
                    type="button"
                    aria-disabled="true"
                    title={MISSING_DOCUMENT_HINT}
                    className={`${childBase} cursor-default text-[#8aa4af]`}
                  >
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      id="siga-sidebar"
      className={`fixed bottom-0 left-0 top-[44px] z-30 w-[230px] overflow-y-auto bg-siga-sidebar text-white transition-transform duration-300 ${className}`}
    >
      <div className="flex items-start gap-[15px] px-2 pt-[10px]">
        <span className="flex h-[46px] w-[46px] shrink-0 items-end justify-center overflow-hidden rounded-full border-2 border-white bg-white">
          <SilhouetteIcon className="h-[44px] w-[44px] translate-y-[3px] text-[#141a1d]" />
        </span>
        <p className="pt-[3px] text-[14px] font-bold">{userProfile.firstName}</p>
      </div>

      <p className="mt-[47px] pb-[13px] pl-[3px] pr-2 text-[14px] leading-[20px]">{userProfile.bond}</p>

      <div className="bg-siga-sidebar-dark py-[10px] text-center text-[11px] leading-[17px]">
        <p>{userProfile.registration}</p>
        <p className="text-[12px] font-bold">{userProfile.unit}</p>
      </div>

      <nav aria-label="Menu principal">
        <ul>
          {navItems.map((item) => {
            if (!item.href) return <TreeItem key={item.label} item={item} />;
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`${itemBase} ${active ? itemActive : itemIdle}`}
                >
                  <Icon className="h-[14px] w-[14px] shrink-0" strokeWidth={2.5} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
