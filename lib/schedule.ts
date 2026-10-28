export const weekDays = [
  "Segunda-Feira",
  "Terça-Feira",
  "Quarta-Feira",
  "Quinta-Feira",
  "Sexta-Feira",
  "Sábado",
  "Domingo",
] as const;

export type WeekDay = (typeof weekDays)[number];

export type ScheduleStatus = "escolhida" | "solicitada" | "matriculado" | "conflito";

export const statusLegend: { status: ScheduleStatus; label: string; className: string }[] = [
  { status: "escolhida", label: "Escolhida", className: "bg-[#3c8dbc]" },
  { status: "solicitada", label: "Solicitada", className: "bg-[#00c0ef]" },
  { status: "matriculado", label: "Matriculado", className: "bg-[#00a65a]" },
  { status: "conflito", label: "Conflito", className: "bg-[#dd4b39]" },
];

// Intervalo exibido na grade (horas cheias).
export const GRID_START_HOUR = 7;
export const GRID_END_HOUR = 18;

type ClassSession = { course: string; day: WeekDay; start: string; end: string; status?: ScheduleStatus };

// Grade genérica de disciplinas comuns de Engenharia Mecânica (período diurno).
export const classSessions: ClassSession[] = [
  { course: "EM201 - RESISTÊNCIA DOS MATERIAIS I - T01", day: "Segunda-Feira", start: "07:30", end: "09:30" },
  { course: "EM202 - TERMODINÂMICA I - T01", day: "Segunda-Feira", start: "09:30", end: "11:30" },
  { course: "EM207 - DESENHO TÉCNICO MECÂNICO - T02", day: "Segunda-Feira", start: "13:30", end: "15:30" },

  { course: "EM203 - MECÂNICA DOS FLUIDOS I - T01", day: "Terça-Feira", start: "07:30", end: "09:30" },
  { course: "MA206 - CÁLCULO NUMÉRICO - T03", day: "Terça-Feira", start: "09:30", end: "11:30" },
  { course: "EM204 - CIÊNCIA DOS MATERIAIS - T01", day: "Terça-Feira", start: "13:30", end: "15:30" },

  { course: "EM201 - RESISTÊNCIA DOS MATERIAIS I - T01", day: "Quarta-Feira", start: "07:30", end: "09:30" },
  { course: "EM205 - DINÂMICA DOS CORPOS RÍGIDOS - T01", day: "Quarta-Feira", start: "09:30", end: "11:30" },
  { course: "EM208 - LABORATÓRIO DE MATERIAIS - T04", day: "Quarta-Feira", start: "13:30", end: "15:30" },

  { course: "EM203 - MECÂNICA DOS FLUIDOS I - T01", day: "Quinta-Feira", start: "07:30", end: "09:30" },
  { course: "EM202 - TERMODINÂMICA I - T01", day: "Quinta-Feira", start: "09:30", end: "11:30" },

  { course: "EM205 - DINÂMICA DOS CORPOS RÍGIDOS - T01", day: "Sexta-Feira", start: "07:30", end: "09:30" },
  { course: "MA206 - CÁLCULO NUMÉRICO - T03", day: "Sexta-Feira", start: "09:30", end: "11:30" },
  { course: "EM204 - CIÊNCIA DOS MATERIAIS - T01", day: "Sexta-Feira", start: "13:30", end: "15:30" },
];

export type ScheduleBlock = {
  key: string;
  course: string;
  dayIndex: number;
  startMinutes: number;
  label: string;
  status: ScheduleStatus;
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

export const formatMinutes = (minutes: number) =>
  `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;

// Cada aula é exibida em blocos de 1 hora, como no sistema original.
export function toHourlyBlocks(sessions: ClassSession[]): ScheduleBlock[] {
  return sessions.flatMap((session) => {
    const blocks: ScheduleBlock[] = [];
    for (let t = toMinutes(session.start); t < toMinutes(session.end); t += 60) {
      blocks.push({
        key: `${session.day}-${t}`,
        course: session.course,
        dayIndex: weekDays.indexOf(session.day),
        startMinutes: t,
        label: `${formatMinutes(t)} - ${formatMinutes(t + 60)}`,
        status: session.status ?? "escolhida",
      });
    }
    return blocks;
  });
}
