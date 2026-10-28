import type { Metadata } from "next";
import { PersonalDataForm } from "@/components/dados-pessoais/PersonalDataForm";
import { ContentBox } from "@/components/ui/ContentBox";

export const metadata: Metadata = { title: "Meus Dados Pessoais · SIGA UFPR" };

export default function DadosPessoaisPage() {
  return (
    <ContentBox>
      <PersonalDataForm />
    </ContentBox>
  );
}
