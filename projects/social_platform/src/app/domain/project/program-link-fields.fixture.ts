/** @format */

import { ProgramLinkFields } from "./program-link-fields.model";
import { PROGRAM_CASE_FIELD_NAME } from "@domain/program/program-case-field.const";

export function programLinkFields(overrides: Partial<ProgramLinkFields> = {}): ProgramLinkFields {
  return {
    programLinkId: 700,
    programId: 12,
    projectId: 55,
    submitted: false,
    fields: [
      {
        id: 5,
        name: PROGRAM_CASE_FIELD_NAME,
        label: "Кейс программы",
        fieldType: "select",
        options: ["A", "B"],
        isRequired: true,
        showFilter: true,
        helpText: "Подробнее о кейсах",
        value: null,
      },
      {
        id: 6,
        name: "track",
        label: "Кейс",
        fieldType: "select",
        options: ["X", "Y"],
        isRequired: false,
        helpText: "Направление",
        value: "Y",
      },
      {
        id: 7,
        name: "note",
        label: "Описание",
        fieldType: "text",
        options: [],
        isRequired: false,
        helpText: "",
        value: null,
      },
      {
        id: 8,
        name: "agree",
        label: "Согласие",
        fieldType: "checkbox",
        options: [],
        isRequired: false,
        helpText: "",
        value: null,
      },
    ],
    ...overrides,
  };
}
