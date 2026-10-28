export type Option = { value: string; label: string };

export const issuingAgencies: Option[] = [
  { value: "SESP/PR", label: "SESP/PR - Secretaria de Estado da Segurança Pública do Paraná" },
  { value: "SSP/SC", label: "SSP/SC - Secretaria de Estado da Segurança Pública de Santa Catarina" },
  { value: "SSP/SP", label: "SSP/SP - Secretaria da Segurança Pública de São Paulo" },
  { value: "SSP/RS", label: "SSP/RS - Secretaria da Segurança Pública do Rio Grande do Sul" },
  { value: "DETRAN/PR", label: "DETRAN/PR - Departamento de Trânsito do Paraná" },
  { value: "PF", label: "PF - Polícia Federal" },
];

export const genderIdentities: Option[] = [
  "Mulher cisgênero",
  "Homem cisgênero",
  "Mulher transgênero",
  "Homem transgênero",
  "Não binário",
  "Outro",
  "Prefiro não responder",
].map((g) => ({ value: g, label: g }));

export const countries: Option[] = ["BRASIL", "ARGENTINA", "PARAGUAI", "URUGUAI", "PORTUGAL", "OUTRO"].map(
  (c) => ({ value: c, label: c }),
);

const toOptions = (values: string[]): Option[] => values.map((v) => ({ value: v, label: v }));

export const races = toOptions(["Branca", "Preta", "Parda", "Amarela", "Indígena", "Não declarada"]);

export const origins = toOptions(["Brasileiro/Naturalizado", "Estrangeiro"]);

export const schoolTypes = toOptions([
  "Estadual",
  "Municipal",
  "Federal",
  "Particular",
  "Particular com bolsa integral",
  "Exterior",
]);

type State ={ uf: string; name: string; cities: string[] };

export const brazilianStates: State[] = [
  { uf: "AC", name: "Acre", cities: ["Rio Branco", "Cruzeiro do Sul"] },
  { uf: "AL", name: "Alagoas", cities: ["Maceió", "Arapiraca"] },
  { uf: "AP", name: "Amapá", cities: ["Macapá", "Santana"] },
  { uf: "AM", name: "Amazonas", cities: ["Manaus", "Parintins"] },
  { uf: "BA", name: "Bahia", cities: ["Salvador", "Feira de Santana", "Vitória da Conquista"] },
  { uf: "CE", name: "Ceará", cities: ["Fortaleza", "Juazeiro do Norte"] },
  { uf: "DF", name: "Distrito Federal", cities: ["Brasília"] },
  { uf: "ES", name: "Espírito Santo", cities: ["Vitória", "Vila Velha"] },
  { uf: "GO", name: "Goiás", cities: ["Goiânia", "Anápolis"] },
  { uf: "MA", name: "Maranhão", cities: ["São Luís", "Imperatriz"] },
  { uf: "MT", name: "Mato Grosso", cities: ["Cuiabá", "Rondonópolis"] },
  { uf: "MS", name: "Mato Grosso do Sul", cities: ["Campo Grande", "Dourados"] },
  { uf: "MG", name: "Minas Gerais", cities: ["Belo Horizonte", "Uberlândia", "Juiz de Fora"] },
  { uf: "PA", name: "Pará", cities: ["Belém", "Santarém"] },
  { uf: "PB", name: "Paraíba", cities: ["João Pessoa", "Campina Grande"] },
  {
    uf: "PR",
    name: "Paraná",
    cities: ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "Foz do Iguaçu", "Matinhos", "Palotina"],
  },
  { uf: "PE", name: "Pernambuco", cities: ["Recife", "Caruaru"] },
  { uf: "PI", name: "Piauí", cities: ["Teresina", "Parnaíba"] },
  { uf: "RJ", name: "Rio de Janeiro", cities: ["Rio de Janeiro", "Niterói"] },
  { uf: "RN", name: "Rio Grande do Norte", cities: ["Natal", "Mossoró"] },
  { uf: "RS", name: "Rio Grande do Sul", cities: ["Porto Alegre", "Caxias do Sul", "Pelotas"] },
  { uf: "RO", name: "Rondônia", cities: ["Porto Velho", "Ji-Paraná"] },
  { uf: "RR", name: "Roraima", cities: ["Boa Vista"] },
  { uf: "SC", name: "Santa Catarina", cities: ["Florianópolis", "Joinville", "Blumenau"] },
  { uf: "SP", name: "São Paulo", cities: ["São Paulo", "Campinas", "Santos"] },
  { uf: "SE", name: "Sergipe", cities: ["Aracaju"] },
  { uf: "TO", name: "Tocantins", cities: ["Palmas", "Araguaína"] },
];

export function findState(uf: string) {
  return brazilianStates.find((s) => s.uf === uf);
}
