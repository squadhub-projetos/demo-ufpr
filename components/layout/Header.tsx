import Link from "next/link";
import { Menu } from "lucide-react";
import { SigaLogo } from "./SigaLogo";
import { SilhouetteIcon } from "@/components/ui/icons";
import { userProfile } from "@/lib/profile";

type HeaderProps = { onToggleMenu: () => void; menuExpanded: boolean };

const pressable =
  "transition-colors duration-100 hover:bg-black/10 active:bg-black/25 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-white/70";

export function Header({ onToggleMenu, menuExpanded }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-[44px] items-center bg-siga-header text-white">
      <Link href="/" aria-label="Início" className="flex h-full shrink-0 justify-center px-2 md:w-[230px] md:px-0">
        <SigaLogo />
      </Link>
      <button
        type="button"
        onClick={onToggleMenu}
        aria-label="Alternar menu"
        aria-expanded={menuExpanded}
        aria-controls="siga-sidebar"
        className={`flex h-full items-center px-[15px] ${pressable}`}
      >
        <Menu className="h-[17px] w-[17px]" strokeWidth={3} aria-hidden="true" />
      </button>

      <div className="ml-auto flex h-full min-w-0 items-center gap-3 pr-[15px]">
        <Link
          href="/dados-pessoais"
          title="Meus Dados Pessoais"
          className={`flex h-full min-w-0 items-center gap-2 px-[5px] ${pressable}`}
        >
          <SilhouetteIcon className="h-[22px] w-[22px] shrink-0 text-[#1f2a30]" />
          <span className="hidden truncate text-[14px] md:inline">{userProfile.fullName}</span>
        </Link>
      </div>
    </header>
  );
}
