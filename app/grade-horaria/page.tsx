import type { Metadata } from "next";
import { SectionTitle } from "@/components/form/SectionTitle";
import { ScheduleGrid, ScheduleLegend } from "@/components/grade-horaria/ScheduleGrid";
import { ContentBox } from "@/components/ui/ContentBox";
import { GridIcon } from "@/components/ui/icons";

export const metadata: Metadata = { title: "Grade Horária · SIGA UFPR" };

export default function GradeHorariaPage() {
  return (
    <ContentBox>
      <SectionTitle className="mb-[15px]" icon={<GridIcon className="h-[18px] w-[22px]" />}>
        Grade Horária
      </SectionTitle>
      <ScheduleLegend />
      <ScheduleGrid />
    </ContentBox>
  );
}
