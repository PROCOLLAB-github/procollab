/** @format */

import { SolutionField, SolutionFieldWrite } from "./solution-contract.model";

export type EditableSolutionField = SolutionFieldWrite & { clientKey: number };
const equal = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
export function fieldWrite(
  field: SolutionFieldWrite,
  position = field.position,
): SolutionFieldWrite {
  return {
    id: field.id,
    type: field.type,
    purpose: field.purpose,
    label: field.label,
    helpText: field.helpText,
    required: field.required,
    position,
    options: [...field.options],
    validation: { ...field.validation, allowedExtensions: [...field.validation.allowedExtensions] },
  };
}
/** Сохраняет локальный ввод и добавления другого организатора; удаленные ID требуют явного решения. */
export function rebaseSolutionFields(
  base: SolutionField[],
  local: EditableSolutionField[],
  remote: SolutionField[],
) {
  const old = new Map(base.map(field => [field.id, field])),
    latest = new Map(remote.map(field => [field.id, field]));
  const missing: number[] = [];
  const fields: EditableSolutionField[] = [];
  for (const localField of local) {
    if (localField.id === null) {
      fields.push(localField);
      continue;
    }
    const before = old.get(localField.id),
      current = latest.get(localField.id);
    if (!current) {
      if (before && equal(fieldWrite(before), fieldWrite(localField))) continue;
      missing.push(localField.id);
      fields.push(localField);
      continue;
    }
    if (!before) {
      fields.push(localField);
      continue;
    }
    const changes = Object.fromEntries(
      Object.entries(fieldWrite(localField)).filter(
        ([key, value]) => key !== "position" && !equal(value, before[key as keyof SolutionField]),
      ),
    );
    const validation = { ...current.validation };
    for (const key of Object.keys(localField.validation) as (keyof typeof validation)[]) {
      if (!equal(localField.validation[key], before.validation[key]))
        Object.assign(validation, { [key]: localField.validation[key] });
    }
    const options = equal(localField.options, before.options)
      ? current.options
      : [
          ...localField.options,
          ...current.options.filter(
            value => !before.options.includes(value) && !localField.options.includes(value),
          ),
        ];
    fields.push({ ...current, ...changes, options, validation, clientKey: localField.clientKey });
  }
  for (const current of remote)
    if (!old.has(current.id) && !fields.some(field => field.id === current.id))
      fields.push({ ...current, clientKey: current.id });
  const localIds = new Set(local.map(field => field.id));
  const originalOrder = base.filter(field => localIds.has(field.id)).map(field => field.id);
  const editedOrder = local
    .filter(field => field.id !== null && old.has(field.id))
    .map(field => field.id);
  const insertedBeforeExisting = local.some(
    (field, index) =>
      field.id === null &&
      local.slice(index + 1).some(next => next.id !== null && old.has(next.id)),
  );
  if (equal(originalOrder, editedOrder) && !insertedBeforeExisting) {
    const rank = new Map(remote.map((field, index) => [field.id, index]));
    fields.sort(
      (a, b) => (rank.get(a.id ?? 0) ?? remote.length) - (rank.get(b.id ?? 0) ?? remote.length),
    );
  }
  return { fields, missing };
}
