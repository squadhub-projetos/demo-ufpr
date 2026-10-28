import Image from "next/image";
import logo from "@/public/siga-ufpr-logo.png";

// Logotipo sobre a aba branca do cabeçalho.
export function SigaLogo() {
  return (
    <span className="flex h-full w-[150px] items-center justify-center rounded-b-[40px] bg-white md:w-[165px]">
      <Image src={logo} alt="SIGA UFPR" priority className="h-auto w-[118px] md:w-[128px]" />
    </span>
  );
}
