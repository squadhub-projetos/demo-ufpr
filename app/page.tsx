import { CalendarDays, Network } from "lucide-react";
import { ShortcutCard } from "@/components/home/ShortcutCard";
import { GridIcon, PersonShape } from "@/components/ui/icons";

export default function HomePage() {
  return (
    <div className="px-[15px] pt-[15px]">
      <h1 className="text-[24px] font-normal leading-[1.1] text-siga-text">Discente Egresso - Graduação</h1>

      <h2 className="mt-[26px] flex items-center gap-[5px] border-b border-[#e3e8ee] pb-[6px] text-[22px] font-normal leading-[1.1] text-siga-text">
        <GridIcon className="h-[18px] w-[22px]" />
        Atalhos
      </h2>

      <div className="mt-[24px] flex flex-wrap gap-[30px]">
        <ShortcutCard
          href="/dados-pessoais"
          title="Dados Pessoais"
          subtitle="Visualizar os dados pessoais"
          icon={<PersonShape className="h-[78px] w-[70px]" />}
        />
        <ShortcutCard
          href="/grade-horaria"
          title="Grade horária"
          subtitle="Visualizar a grade horária"
          icon={<CalendarDays className="h-[78px] w-[78px]" strokeWidth={2.4} />}
        />
        <ShortcutCard
          title="Integração"
          subtitle="Visualizar dados de integração"
          icon={<Network className="h-[78px] w-[78px]" strokeWidth={2.4} />}
        />
      </div>
    </div>
  );
}
