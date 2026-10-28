import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { Option } from "@/lib/options";

// Larguras equivalentes às colunas do grid de 12 colunas da referência (desktop).
const spans = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  4: "lg:col-span-4",
  5: "lg:col-span-5",
  6: "lg:col-span-6",
  8: "lg:col-span-8",
  12: "lg:col-span-12",
} as const;

export type ColSpan = keyof typeof spans;

export function FormRow({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-x-[30px] lg:grid-cols-12">{children}</div>;
}

type FormGroupProps = {
  id: string;
  label: string;
  span: ColSpan;
  required?: boolean;
  help?: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

export function FormGroup({ id, label, span, required, help, error, className = "", children }: FormGroupProps) {
  return (
    <div className={`mb-[15px] min-w-0 ${spans[span]} ${className}`}>
      <label htmlFor={id} className="mb-[5px] inline-block text-[14px] font-bold text-siga-text">
        {required && <span aria-hidden="true">*</span>}
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-[5px] text-[13px] text-field-error">
          {error}
        </p>
      ) : (
        help && <p className="mt-2 mb-[5px] text-[14px] text-siga-help">{help}</p>
      )}
    </div>
  );
}

type Tone = "default" | "muted";

function controlClasses({ tone, invalid }: { tone: Tone; invalid?: boolean }) {
  const border = invalid ? "border-field-error focus:border-field-error" : "border-field-border focus:border-siga-accent";
  const background = tone === "muted" ? "bg-field-readonly" : "bg-white";
  return `block h-[34px] w-full rounded-none border px-3 text-[14px] text-siga-muted outline-none transition-colors ${border} ${background}`;
}

type TextInputProps = InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean };

export function TextInput({ invalid, readOnly, className = "", id, ...props }: TextInputProps) {
  return (
    <input
      id={id}
      readOnly={readOnly}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={`${controlClasses({ tone: readOnly ? "muted" : "default", invalid })} ${
        readOnly ? "cursor-default focus:border-field-border" : ""
      } ${className}`}
      {...props}
    />
  );
}

type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
  tone?: Tone;
  invalid?: boolean;
  placeholder?: string;
};

export function SelectInput({ options, tone = "default", invalid, placeholder, id, ...props }: SelectInputProps) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? `${id}-error` : undefined}
      className={`${controlClasses({ tone, invalid })} pl-[13px] disabled:cursor-not-allowed`}
      {...props}
    >
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
