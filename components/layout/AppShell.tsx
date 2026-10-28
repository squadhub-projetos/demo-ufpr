"use client";

import { useState, type ReactNode } from "react";
import type { DefaultDocuments } from "@/lib/documents";
import { DefaultDocumentsProvider } from "@/lib/documentsClient";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

const DESKTOP_QUERY = "(min-width: 768px)";

type AppShellProps = { defaultDocuments: DefaultDocuments; children: ReactNode };

export function AppShell({ defaultDocuments, children }: AppShellProps) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  function toggleMenu() {
    if (window.matchMedia(DESKTOP_QUERY).matches) setDesktopCollapsed((v) => !v);
    else setMobileOpen((v) => !v);
  }

  const sidebarState = `${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${
    desktopCollapsed ? "md:-translate-x-full" : "md:translate-x-0"
  }`;

  return (
    <DefaultDocumentsProvider defaults={defaultDocuments}>
      <Header onToggleMenu={toggleMenu} menuExpanded={mobileOpen || !desktopCollapsed} />
      <Sidebar className={sidebarState} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 top-[44px] z-20 bg-black/40 md:hidden"
        />
      )}
      <div className={`transition-[margin] duration-300 ${desktopCollapsed ? "md:ml-0" : "md:ml-[230px]"}`}>
        <main className="min-h-screen pt-[44px]">{children}</main>
        <Footer />
      </div>
    </DefaultDocumentsProvider>
  );
}
