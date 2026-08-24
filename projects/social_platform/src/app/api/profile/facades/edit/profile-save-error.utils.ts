/** @format */

type ValidationBody = unknown;

const GENERIC_SAVE_ERROR = "Ошибка при сохранении профиля";

const FIELD_LABELS: Record<string, string> = {
  first_name: "Имя",
  firstName: "Имя",
  last_name: "Фамилия",
  lastName: "Фамилия",
  birthday: "Дата рождения",
  phone_number: "Телефон",
  phoneNumber: "Телефон",
  skills_ids: "Навыки",
  skillsIds: "Навыки",
  language: "Языки",
  user_languages: "Языки",
  userLanguages: "Языки",
  education: "Образование",
  work_experience: "Опыт работы",
  workExperience: "Опыт работы",
  achievements: "Достижения",
  entry_year: "год начала",
  entryYear: "год начала",
  completion_year: "год окончания",
  completionYear: "год окончания",
  organization_name: "организация",
  organizationName: "организация",
  education_status: "статус обучения",
  educationStatus: "статус обучения",
  education_level: "уровень образования",
  educationLevel: "уровень образования",
  job_position: "должность",
  jobPosition: "должность",
  title: "название",
  status: "статус",
  year: "год",
  files: "файлы",
  non_field_errors: "Ошибка",
};

const COLLECTION_ITEM_LABELS: Record<string, string> = {
  education: "Образование",
  work_experience: "Опыт работы",
  workExperience: "Опыт работы",
  achievements: "Достижение",
  user_languages: "Язык",
  userLanguages: "Язык",
};

const MESSAGE_TRANSLATIONS: Array<[RegExp, string]> = [
  [/age.*12.*99|12.*99/i, "возраст должен быть от 12 до 99 лет"],
  [/only.*cyrillic|кирил/i, "используйте только кириллицу"],
  [
    /phone.*international|valid phone|invalid phone|номер телефона/i,
    "укажите телефон в международном формате, например +79991234567",
  ],
  [/at least 1.*skill|1.*20.*skill|skills/i, "необходимо выбрать от 1 до 20 навыков"],
  [/no more than 4.*languages|more than 4|не более 4/i, "можно добавить не более 4 языков"],
  [/duplicate.*language|одинаков/i, "нельзя добавлять одинаковые языки"],
  [/required|обязат/i, "поле обязательно для заполнения"],
  [/valid date|invalid date|incorrect date|date has wrong format/i, "укажите корректную дату"],
  [
    /start.*finish|entry.*completion|год начала/i,
    "год начала должен быть меньше или равен году окончания",
  ],
  [/blank|empty/i, "поле не должно быть пустым"],
  [/Ensure this field has no more than (\d+) characters/i, "превышена допустимая длина"],
];

export const translateProfileSaveMessage = (message: unknown): string => {
  const text = String(message ?? "").trim();
  if (!text) return "";

  const translated = MESSAGE_TRANSLATIONS.find(([pattern]) => pattern.test(text))?.[1];
  return translated ?? text;
};

const fieldLabel = (key: string): string => FIELD_LABELS[key] ?? key;

const collectionItemLabel = (key: string, index: number): string => {
  const base = COLLECTION_ITEM_LABELS[key] ?? fieldLabel(key);
  return `${base} #${index + 1}`;
};

const normalizeValidationPath = (path: string[]): string => {
  const readableParts = path.reduce<string[]>((acc, part, index) => {
    const previous = path[index - 1];
    const itemIndex = Number(part);

    if (Number.isInteger(itemIndex) && previous) {
      acc[acc.length - 1] = collectionItemLabel(previous, itemIndex);
      return acc;
    }

    acc.push(fieldLabel(part));
    return acc;
  }, []);

  return readableParts.join(": ");
};

const collectValidationMessages = (body: ValidationBody, path: string[] = []): string[] => {
  if (body == null) return [];

  if (typeof body === "string" || typeof body === "number" || typeof body === "boolean") {
    const message = translateProfileSaveMessage(body);
    const prefix = normalizeValidationPath(path);
    return message ? [`${prefix ? `${prefix}: ` : ""}${message}`] : [];
  }

  if (Array.isArray(body)) {
    return body.flatMap((item, index) => {
      const nextPath =
        item && typeof item === "object" && !Array.isArray(item) ? [...path, String(index)] : path;
      return collectValidationMessages(item, nextPath);
    });
  }

  if (typeof body === "object") {
    return Object.entries(body as Record<string, unknown>).flatMap(([key, value]) =>
      collectValidationMessages(value, [...path, key]),
    );
  }

  return [];
};

export const resolveProfileSaveErrorText = (cause?: { error?: unknown }): string => {
  const messages = collectValidationMessages(cause?.error);
  return messages.length ? messages.join("; ") : GENERIC_SAVE_ERROR;
};
