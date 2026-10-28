import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowCircleRightIcon } from "@/components/ui/icons";
import { UNAVAILABLE_HINT } from "@/lib/navigation";

// Sem `href`, o card é apenas visual (sem ação ao clicar).
type ShortcutCardProps = { href?: string; title: string; subtitle: string; icon: ReactNode };

export function ShortcutCard({ href, title, subtitle, icon }: ShortcutCardProps) {
  const content = (
    <>
      <div className="relative z-10 px-[15px] pb-[14px] pt-[15px]">
        <h3 className="mb-3 text-[36px] font-bold leading-[1.1]">{title}</h3>
        <p className="text-[15px] leading-5">{subtitle}</p>
      </div>
      <span className="pointer-events-none absolute right-5 top-[30px] text-black/15 transition-transform duration-300 group-hover:scale-110">
        {icon}
      </span>
      <span className="relative flex h-[26px] items-center justify-center gap-[3px] bg-black/10 text-[13px] transition-colors group-hover:bg-black/15">
        Acessar
        <ArrowCircleRightIcon className="h-[13px] w-[13px] text-white" />
      </span>
    </>
  );
  const base =
    "group relative block w-full select-none overflow-hidden bg-siga-aqua text-white transition-[filter,transform] duration-150 hover:brightness-105 active:scale-[0.985] active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-siga-accent sm:w-[389px]";

  if (!href) {
    return (
      <div role="button" tabIndex={0} aria-disabled="true" title={UNAVAILABLE_HINT} className={`${base} cursor-default`}>
        {content}
      </div>
    );
  }

  return (
    <Link href={href} className={base}>
      {content}
    </Link>
  );
}
