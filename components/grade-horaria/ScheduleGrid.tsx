import {
  classSessions,
  GRID_END_HOUR,
  GRID_START_HOUR,
  statusLegend,
  toHourlyBlocks,
  weekDays,
  type ScheduleStatus,
} from "@/lib/schedule";

const HOUR_HEIGHT = 81;
const COLUMNS = weekDays.length + 1;
const columnWidth = 100 / COLUMNS;

const blockColors: Record<ScheduleStatus, string> = {
  escolhida: "bg-[#4f7392] border-[#3e5f7c]",
  solicitada: "bg-[#3aa6c9] border-[#2b8db0]",
  matriculado: "bg-[#3f9a62] border-[#2f804f]",
  conflito: "bg-[#d0533f] border-[#b04332]",
};

export function ScheduleLegend() {
  return (
    <div className="mb-[10px] flex flex-wrap gap-[3px]">
      {statusLegend.map(({ status, label, className }) => (
        <span
          key={status}
          className={`rounded-[3px] px-[6px] py-[3px] text-[11px] font-bold leading-none text-white ${className}`}
        >
          {label}
        </span>
      ))}
    </div>
  );
}

export function ScheduleGrid() {
  const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR + 1 }, (_, i) => GRID_START_HOUR + i);
  const blocks = toHourlyBlocks(classSessions);
  const bodyHeight = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-8 bg-[#263036] text-[13px] font-bold text-white">
          {["Horário", ...weekDays].map((label) => (
            <div
              key={label}
              className="h-[44px] border-r border-dashed border-[#5b666c] pt-[4px] text-center last:border-r-0"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="relative border-b border-dashed border-[#8a8a8a] bg-[#d3d3d3]" style={{ height: bodyHeight }}>
          {hours.map((hour, i) => (
            <div key={hour} className="absolute inset-x-0" style={{ top: i * HOUR_HEIGHT }}>
              {i > 0 && i < hours.length - 1 && <div className="border-t border-dashed border-[#8a8a8a]" />}
              {i < hours.length - 1 && (
                <span className="absolute left-0 top-[1px] text-[12px] text-[#333]">
                  {String(hour).padStart(2, "0")}:00
                </span>
              )}
            </div>
          ))}

          {blocks.map((block) => (
            <div
              key={block.key}
              title={`${block.course}\n${block.label}`}
              className={`absolute overflow-hidden border px-[3px] pt-[3px] text-white transition-[filter] duration-100 hover:brightness-110 ${blockColors[block.status]}`}
              style={{
                left: `${(block.dayIndex + 1) * columnWidth}%`,
                width: `${columnWidth}%`,
                top: ((block.startMinutes - GRID_START_HOUR * 60) / 60) * HOUR_HEIGHT,
                height: HOUR_HEIGHT,
              }}
            >
              <p className="truncate text-[11px] font-bold uppercase leading-[16px]">{block.course}</p>
              <p className="text-[12px] font-bold leading-[16px]">{block.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
