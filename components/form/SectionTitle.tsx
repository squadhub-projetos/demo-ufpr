import type { ReactNode } from "react";

type SectionTitleProps = { icon?: ReactNode; children: ReactNode; className?: string };

export function SectionTitle({ icon, children, className = "" }: SectionTitleProps) {
  return (
    <h3
      className={`flex items-center gap-[5px] border-b border-[#eee] pb-[9px] text-[22px] font-normal leading-[1.1] text-siga-text ${className}`}
    >
      {icon}
      {children}
    </h3>
  );
}

// Subtítulo sem linha divisória (Endereço, Contato, Ensino médio).
export function SubsectionTitle({ children }: { children: ReactNode }) {
  return <h4 className="mb-[10px] mt-[10px] text-[18px] font-normal leading-[1.1] text-siga-text">{children}</h4>;
}
