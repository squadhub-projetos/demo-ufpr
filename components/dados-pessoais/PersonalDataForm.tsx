"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { FileUpload } from "./FileUpload";
import { FormGroup, FormRow, SelectInput, TextInput } from "@/components/form/fields";
import { SectionTitle, SubsectionTitle } from "@/components/form/SectionTitle";
import { GridIcon } from "@/components/ui/icons";
import {
  documentTypes,
  loadDocuments,
  resolveDocuments,
  saveDocuments,
  type DocumentType,
  type StoredDocument,
} from "@/lib/documents";
import { useDefaultDocuments } from "@/lib/documentsClient";
import { userProfile } from "@/lib/profile";
import {
  brazilianStates,
  countries,
  findState,
  genderIdentities,
  issuingAgencies,
  origins,
  races,
  schoolTypes,
} from "@/lib/options";

type FormState = {
  rg: string;
  issuingAgency: string;
  issueDate: string;
  gender: string;
  birthCountry: string;
  birthState: string;
  birthCity: string;
  race: string;
  origin: string;
  address: string;
  addressNumber: string;
  addressComplement: string;
  district: string;
  zipCode: string;
  addressCountry: string;
  addressState: string;
  addressCity: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  highSchoolType: string;
};

type Field = keyof FormState;
type Errors = Partial<Record<Field, string>>;

const initialState: FormState = {
  rg: userProfile.rg,
  issuingAgency: userProfile.issuingAgency,
  issueDate: userProfile.issueDate,
  gender: userProfile.gender,
  birthCountry: userProfile.birthCountry,
  birthState: userProfile.birthState,
  birthCity: userProfile.birthCity,
  race: userProfile.race,
  origin: userProfile.origin,
  address: userProfile.address,
  addressNumber: userProfile.addressNumber,
  addressComplement: userProfile.addressComplement,
  district: userProfile.district,
  zipCode: userProfile.zipCode,
  addressCountry: userProfile.addressCountry,
  addressState: userProfile.addressState,
  addressCity: userProfile.addressCity,
  phone: userProfile.phone,
  secondaryPhone: userProfile.secondaryPhone,
  email: userProfile.email,
  highSchoolType: userProfile.highSchoolType,
};

// Trios país/estado/cidade que compartilham a mesma lógica de dependência.
const locationKeys = {
  birth: { country: "birthCountry", state: "birthState", city: "birthCity" },
  address: { country: "addressCountry", state: "addressState", city: "addressCity" },
} as const;

type LocationKind = keyof typeof locationKeys;

const stateOptions = brazilianStates.map((s) => ({ value: s.uf, label: s.name }));

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Um arquivo por documento do menu.
const MAX_FILES = documentTypes.length;

function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)].filter(Boolean).join("/");
}

function maskZip(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function maskPhone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  const local = digits.slice(2);
  const split = local.length > 8 ? 5 : 4;
  const body = local.length > split ? `${local.slice(0, split)}-${local.slice(split)}` : local;
  return `${digits.slice(0, 2)} ${body}`;
}

function parseBrDate(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (!match) return null;
  const [day, month, year] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day);
  const valid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

function validate(form: FormState): Errors {
  const errors: Errors = {};
  const rg = form.rg.trim();

  if (!rg) errors.rg = "Informe o RG.";
  else if (!/^[0-9A-Za-z.\-]{5,14}$/.test(rg)) errors.rg = "RG inválido. Use de 5 a 14 caracteres (números, pontos ou hífen).";

  if (!form.issuingAgency) errors.issuingAgency = "Selecione o órgão expedidor.";

  const issued = parseBrDate(form.issueDate);
  const birth = parseBrDate(userProfile.birthDate);
  if (!form.issueDate) errors.issueDate = "Informe a data de emissão.";
  else if (!issued) errors.issueDate = "Data inválida. Use o formato dd/mm/aaaa.";
  else if (issued > new Date()) errors.issueDate = "A data de emissão não pode estar no futuro.";
  else if (birth && issued < birth) errors.issueDate = "A data de emissão não pode ser anterior ao nascimento.";

  for (const keys of Object.values(locationKeys)) {
    if (form[keys.country] !== "BRASIL") continue;
    if (!form[keys.state]) errors[keys.state] = "Selecione o estado.";
    if (!form[keys.city]) errors[keys.city] = "Selecione a cidade.";
  }

  if (form.zipCode && !/^\d{5}-\d{3}$/.test(form.zipCode)) errors.zipCode = "CEP inválido.";
  if (form.phone && !/^\d{2} \d{4,5}-\d{4}$/.test(form.phone)) errors.phone = "Telefone inválido.";
  if (form.secondaryPhone && !/^\d{2} \d{4,5}-\d{4}$/.test(form.secondaryPhone))
    errors.secondaryPhone = "Telefone inválido.";

  if (!form.email.trim()) errors.email = "Informe um e-mail.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errors.email = "E-mail inválido.";

  return errors;
}

export function PersonalDataForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Anexos personalizados ainda não salvos; os padrões vêm do projeto e nunca são alterados.
  const [files, setFiles] = useState<StoredDocument[]>([]);
  const [fileError, setFileError] = useState<string>();
  const defaultDocuments = useDefaultDocuments();
  const documents = resolveDocuments(files, defaultDocuments);

  // Recupera os anexos salvos anteriormente neste navegador.
  useEffect(() => {
    loadDocuments()
      .then((saved) => setFiles((prev) => (prev.length > 0 ? prev : saved)))
      .catch(() => setFileError("Não foi possível carregar os anexos salvos."));
  }, []);

  function addFiles(selected: File[], target?: DocumentType) {
    const invalidType = selected.find((f) => !ACCEPTED_TYPES.includes(f.type));
    const tooLarge = selected.find((f) => f.size > MAX_FILE_SIZE);
    if (invalidType) return setFileError(`"${invalidType.name}" não é um PDF, JPG ou PNG.`);
    if (tooLarge) return setFileError(`"${tooLarge.name}" ultrapassa 5 MB.`);

    if (target) {
      // Substituição de um documento específico (ex.: trocar o arquivo padrão).
      setFiles((prev) => [...prev.filter((f) => f.type !== target), { file: selected[0], type: target }]);
    } else {
      if (files.length + selected.length > MAX_FILES) return setFileError(`Selecione no máximo ${MAX_FILES} arquivos.`);
      // Cada novo arquivo recebe o primeiro documento sem anexo personalizado,
      // priorizando os que também não têm arquivo padrão.
      const free = documentTypes
        .map((d) => d.id)
        .filter((t) => !files.some((f) => f.type === t))
        .sort((a, b) => Number(Boolean(defaultDocuments[a])) - Number(Boolean(defaultDocuments[b])));
      setFiles((prev) => [...prev, ...selected.map((file, i) => ({ file, type: free[i] }))]);
    }
    setFileError(undefined);
    setSavedAt(null);
  }

  // Ao escolher um documento já usado por outro anexo, os dois trocam de lugar.
  function changeFileType(from: DocumentType, to: DocumentType) {
    setFiles((prev) =>
      prev.map((f) => {
        if (f.type === from) return { ...f, type: to };
        if (f.type === to) return { ...f, type: from };
        return f;
      }),
    );
    setSavedAt(null);
  }

  // Remove o anexo personalizado; havendo arquivo padrão, ele volta a ser usado.
  function removeFile(type: DocumentType) {
    setFiles((prev) => prev.filter((f) => f.type !== type));
    setFileError(undefined);
    setSavedAt(null);
  }

  function clear(...fields: Field[]) {
    setErrors((prev) => {
      const next = { ...prev };
      for (const f of fields) delete next[f];
      return next;
    });
    setSavedAt(null);
  }

  function update(key: Field, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    clear(key);
  }

  function changeCountry(kind: LocationKind, country: string) {
    const k = locationKeys[kind];
    setForm((prev) => {
      const brazil = country === "BRASIL";
      const uf = brazil ? prev[k.state] || "PR" : "";
      const city = brazil ? prev[k.city] || (findState(uf)?.cities[0] ?? "") : "";
      return { ...prev, [k.country]: country, [k.state]: uf, [k.city]: city };
    });
    clear(k.state, k.city);
  }

  function changeState(kind: LocationKind, uf: string) {
    const k = locationKeys[kind];
    setForm((prev) => ({ ...prev, [k.state]: uf, [k.city]: findState(uf)?.cities[0] ?? "" }));
    clear(k.state, k.city);
  }

  function locationProps(kind: LocationKind) {
    const k = locationKeys[kind];
    const isBrazil = form[k.country] === "BRASIL";
    const cities = (findState(form[k.state])?.cities ?? []).map((c) => ({ value: c, label: c }));
    const unavailable = isBrazil ? undefined : "Não se aplica";
    return {
      country: { value: form[k.country], onChange: (v: string) => changeCountry(kind, v) },
      state: { value: form[k.state], disabled: !isBrazil, placeholder: unavailable, error: errors[k.state] },
      city: { value: form[k.city], disabled: !isBrazil, placeholder: unavailable, error: errors[k.city], options: cities },
    };
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    setSavedAt(null);
    if (Object.keys(nextErrors).length > 0) return;
    setSaving(true);
    // Tempo mínimo de "salvando" para dar retorno visual ao clique.
    const minDelay = new Promise((resolve) => window.setTimeout(resolve, 600));
    Promise.all([saveDocuments(files), minDelay])
      .then(() => setSavedAt(new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })))
      .catch(() => setFileError("Não foi possível salvar os anexos. Tente novamente."))
      .finally(() => setSaving(false));
  }

  const birth = locationProps("birth");
  const home = locationProps("address");
  const birthStateName = findState(form.birthState)?.name;
  const birthPlace =
    form.birthCountry === "BRASIL" ? [form.birthCity, birthStateName].filter(Boolean).join(" - ") : form.birthCountry;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <SectionTitle icon={<GridIcon className="h-[18px] w-[22px]" />}>Meus Dados</SectionTitle>

      <p className="mb-[13px] mt-[22px] text-[14px] text-siga-muted">
        Se estas informações estiverem incorretas, favor enviar um e-mail com documento comprobatório para{" "}
        <strong className="text-siga-text">atendimento@ufpr.br</strong> e solicitar a correção.
      </p>

      <FormRow>
        <FormGroup id="documento" label="Documento" span={2} help="CPF ou PASSAPORTE">
          <TextInput id="documento" value={userProfile.document} readOnly />
        </FormGroup>
        <FormGroup id="nome" label="Nome" span={5}>
          <TextInput id="nome" value={userProfile.fullName} readOnly />
        </FormGroup>
        <FormGroup id="nome-social" label="Nome social" span={5}>
          <TextInput id="nome-social" value={userProfile.socialName} readOnly />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="nome-pai" label="Nome do pai" span={6}>
          <TextInput id="nome-pai" value={userProfile.fatherName} readOnly />
        </FormGroup>
        <FormGroup id="nome-mae" label="Nome da mãe" span={6}>
          <TextInput id="nome-mae" value={userProfile.motherName} readOnly />
        </FormGroup>
      </FormRow>

      <SectionTitle className="mb-[22px] mt-[10px]">Dados Complementares</SectionTitle>

      <FormRow>
        <FormGroup id="rg" label="RG" span={5} required error={errors.rg}>
          <TextInput
            id="rg"
            value={form.rg}
            maxLength={14}
            autoComplete="off"
            invalid={Boolean(errors.rg)}
            onChange={(e) => update("rg", e.target.value.toUpperCase())}
          />
        </FormGroup>
        <FormGroup id="orgao-expedidor" label="Orgão Expedidor" span={5} required error={errors.issuingAgency}>
          <SelectInput
            id="orgao-expedidor"
            value={form.issuingAgency}
            options={issuingAgencies}
            placeholder="Selecione"
            invalid={Boolean(errors.issuingAgency)}
            onChange={(e) => update("issuingAgency", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="data-emissao" label="Data de emissão" span={5} required error={errors.issueDate}>
          <TextInput
            id="data-emissao"
            value={form.issueDate}
            placeholder="dd/mm/aaaa"
            inputMode="numeric"
            autoComplete="off"
            invalid={Boolean(errors.issueDate)}
            onChange={(e) => update("issueDate", maskDate(e.target.value))}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="identidade-genero" label="Identidade de Gênero" span={6}>
          <SelectInput
            id="identidade-genero"
            tone="muted"
            value={form.gender}
            options={genderIdentities}
            onChange={(e) => update("gender", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="data-nascimento" label="Data de Nascimento" span={2}>
          <TextInput id="data-nascimento" value={userProfile.birthDate} readOnly />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="pais-nascimento" label="País de Nascimento" span={5}>
          <SelectInput
            id="pais-nascimento"
            tone="muted"
            value={birth.country.value}
            options={countries}
            onChange={(e) => birth.country.onChange(e.target.value)}
          />
        </FormGroup>
        <FormGroup id="estado-nascimento" label="Estado de Nascimento" span={5} error={birth.state.error}>
          <SelectInput
            id="estado-nascimento"
            tone="muted"
            value={birth.state.value}
            options={stateOptions}
            placeholder={birth.state.placeholder}
            disabled={birth.state.disabled}
            invalid={Boolean(birth.state.error)}
            onChange={(e) => changeState("birth", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="cidade-nascimento" label="Cidade de Nascimento" span={5} error={birth.city.error}>
          <SelectInput
            id="cidade-nascimento"
            tone="muted"
            value={birth.city.value}
            options={birth.city.options}
            placeholder={birth.city.placeholder}
            disabled={birth.city.disabled}
            invalid={Boolean(birth.city.error)}
            onChange={(e) => update("birthCity", e.target.value)}
          />
        </FormGroup>
        <FormGroup id="local-nascimento" label="Local de Nascimento" span={4}>
          <TextInput id="local-nascimento" value={birthPlace} readOnly />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="filiacao-pai" label="Nome do Pai" span={6}>
          <TextInput id="filiacao-pai" value={userProfile.fatherName} readOnly />
        </FormGroup>
        <FormGroup id="filiacao-mae" label="Nome da Mãe" span={6}>
          <TextInput id="filiacao-mae" value={userProfile.motherName} readOnly />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="cor-raca" label="Cor/Raça" span={5}>
          <SelectInput
            id="cor-raca"
            tone="muted"
            value={form.race}
            options={races}
            onChange={(e) => update("race", e.target.value)}
          />
        </FormGroup>
        <FormGroup id="origem" label="Origem" span={4} className="lg:max-w-[440px]">
          <SelectInput
            id="origem"
            tone="muted"
            value={form.origin}
            options={origins}
            onChange={(e) => update("origin", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <SubsectionTitle>Endereço</SubsectionTitle>

      <FormRow>
        <FormGroup id="endereco" label="Endereço" span={8}>
          <TextInput
            id="endereco"
            value={form.address}
            maxLength={120}
            autoComplete="street-address"
            onChange={(e) => update("address", e.target.value.toUpperCase())}
          />
        </FormGroup>
        <FormGroup id="numero" label="Número" span={2}>
          <TextInput
            id="numero"
            value={form.addressNumber}
            maxLength={10}
            onChange={(e) => update("addressNumber", e.target.value.toUpperCase())}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="complemento" label="Complemento" span={5}>
          <TextInput
            id="complemento"
            value={form.addressComplement}
            maxLength={60}
            onChange={(e) => update("addressComplement", e.target.value.toUpperCase())}
          />
        </FormGroup>
        <FormGroup id="bairro" label="Bairro" span={4}>
          <TextInput
            id="bairro"
            value={form.district}
            maxLength={60}
            onChange={(e) => update("district", e.target.value.toUpperCase())}
          />
        </FormGroup>
        <FormGroup id="cep" label="CEP" span={1} className="lg:min-w-[120px]" error={errors.zipCode}>
          <TextInput
            id="cep"
            value={form.zipCode}
            inputMode="numeric"
            autoComplete="postal-code"
            invalid={Boolean(errors.zipCode)}
            onChange={(e) => update("zipCode", maskZip(e.target.value))}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="pais" label="País" span={5}>
          <SelectInput
            id="pais"
            value={home.country.value}
            options={countries}
            onChange={(e) => home.country.onChange(e.target.value)}
          />
        </FormGroup>
        <FormGroup id="estado" label="Estado" span={5} error={home.state.error}>
          <SelectInput
            id="estado"
            value={home.state.value}
            options={stateOptions}
            placeholder={home.state.placeholder}
            disabled={home.state.disabled}
            invalid={Boolean(home.state.error)}
            onChange={(e) => changeState("address", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="cidade" label="Cidade" span={5} error={home.city.error}>
          <SelectInput
            id="cidade"
            value={home.city.value}
            options={home.city.options}
            placeholder={home.city.placeholder}
            disabled={home.city.disabled}
            invalid={Boolean(home.city.error)}
            onChange={(e) => update("addressCity", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <SubsectionTitle>Contato</SubsectionTitle>

      <FormRow>
        <FormGroup id="telefone" label="Telefone" span={4} error={errors.phone}>
          <TextInput
            id="telefone"
            type="tel"
            value={form.phone}
            autoComplete="tel"
            invalid={Boolean(errors.phone)}
            onChange={(e) => update("phone", maskPhone(e.target.value))}
          />
        </FormGroup>
        <FormGroup id="telefone-secundario" label="Telefone Secundário" span={4} error={errors.secondaryPhone}>
          <TextInput
            id="telefone-secundario"
            type="tel"
            value={form.secondaryPhone}
            invalid={Boolean(errors.secondaryPhone)}
            onChange={(e) => update("secondaryPhone", maskPhone(e.target.value))}
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup id="email" label="Email" span={4} error={errors.email}>
          <TextInput
            id="email"
            type="email"
            value={form.email}
            maxLength={120}
            autoComplete="email"
            invalid={Boolean(errors.email)}
            onChange={(e) => update("email", e.target.value)}
          />
        </FormGroup>
        <FormGroup id="email-institucional" label="Email Institucional" span={4}>
          <TextInput id="email-institucional" value={userProfile.institutionalEmail} readOnly />
        </FormGroup>
      </FormRow>

      <SubsectionTitle>Ensino médio</SubsectionTitle>

      <FormRow>
        <FormGroup id="ano-conclusao" label="Ano de conclusão" span={2}>
          <TextInput id="ano-conclusao" value={userProfile.highSchoolYear} readOnly />
        </FormGroup>
        <FormGroup id="tipo-escola" label="Tipo de escola que cursou o Ensino Médio" span={4}>
          <SelectInput
            id="tipo-escola"
            tone="muted"
            value={form.highSchoolType}
            options={schoolTypes}
            onChange={(e) => update("highSchoolType", e.target.value)}
          />
        </FormGroup>
      </FormRow>

      <FileUpload
        id="anexos"
        documents={documents}
        defaults={defaultDocuments}
        maxFiles={MAX_FILES}
        error={fileError}
        onAdd={addFiles}
        onChangeType={changeFileType}
        onRemove={removeFile}
      />

      <button
        type="submit"
        disabled={saving}
        aria-busy={saving}
        className="inline-flex select-none items-center gap-[3px] rounded-[3px] border border-[#4cae4c] bg-[#5cb85c] px-3 py-[6px] text-[14px] text-white transition-[background-color,box-shadow,transform] duration-100 hover:border-[#398439] hover:bg-[#449d44] active:translate-y-px active:bg-[#398439] active:shadow-[inset_0_3px_5px_rgba(0,0,0,0.125)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4cae4c] disabled:cursor-wait disabled:opacity-80"
      >
        {saving ? (
          <LoaderCircle className="h-[14px] w-[14px] animate-spin" strokeWidth={2.5} aria-hidden="true" />
        ) : (
          <Save className="h-[14px] w-[14px]" strokeWidth={2.5} aria-hidden="true" />
        )}
        {saving ? "Salvando..." : "Salvar"}
      </button>
      {savedAt && (
        <p role="status" className="mt-[15px] border border-[#d6e9c6] bg-[#dff0d8] px-[15px] py-[10px] text-[#3c763d]">
          Alterações aplicadas às {savedAt}
          {files.length > 0 && ` · ${files.length} arquivo${files.length > 1 ? "s" : ""} anexado${files.length > 1 ? "s" : ""}`}.
        </p>
      )}
      {Object.values(errors).some(Boolean) && (
        <p role="alert" className="mt-[15px] border border-[#ebccd1] bg-[#f2dede] px-[15px] py-[10px] text-[#a94442]">
          Verifique os campos destacados antes de salvar.
        </p>
      )}
    </form>
  );
}
