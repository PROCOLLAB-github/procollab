/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { solutionError } from "./solution-error";

describe("solutionError localization", () => {
  it("переводит только отображаемые сообщения, сохраняя коды, ID, пути и метаданные C00", () => {
    const result = solutionError(
      new HttpErrorResponse({
        status: 409,
        error: {
          code: "revision_conflict",
          detail: "Revision is stale",
          errors: [
            {
              path: "answers.42",
              code: "min_value",
              detail: "Ensure this value is greater than or equal to 0.",
              field_id: 42,
              criterion_id: 7,
            },
          ],
          meta: { revision: "opaque-English-revision", expected_version: 0, protected: false },
        },
      }),
    );
    expect(result).toEqual({
      code: "revision_conflict",
      detail: "Данные изменились. Обновите страницу и повторите действие.",
      errors: [
        {
          path: "answers.42",
          code: "min_value",
          detail: "Значение должно быть не меньше 0.",
          fieldId: 42,
          criterionId: 7,
        },
      ],
      meta: { revision: "opaque-English-revision", expectedVersion: 0, protected: false },
    });
  });

  it("сохраняет русскую бизнес-причину отказа", () => {
    expect(
      solutionError(
        new HttpErrorResponse({
          status: 409,
          error: {
            code: "protected_assignment",
            detail: "Назначение защищено сохраненной оценкой.",
            errors: [],
          },
        }),
      ).detail,
    ).toBe("Назначение защищено сохраненной оценкой.");
  });
});
