import type { ReactNode } from "react";

// Painel branco das páginas internas.
export function ContentBox({ children }: { children: ReactNode }) {
  return (
    <div className="px-[15px] py-[15px] md:px-10 md:py-[25px]">
      <section className="bg-white px-[15px] pb-5 pt-[30px] md:px-5">{children}</section>
    </div>
  );
}
