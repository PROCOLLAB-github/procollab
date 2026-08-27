/** @format */

import {
  getSendVacancyResponseError,
  getVacancyResponsesLoadError,
} from "./vacancy-response-error";

describe("vacancy response errors", () => {
  it("различает duplicate validation", () => {
    expect(
      getSendVacancyResponseError({
        status: 400,
        error: ["Вы уже откликнулись на эту вакансию."],
      }),
    ).toBe("Вы уже откликнулись на эту вакансию");
  });

  it("различает отклик участника собственного проекта", () => {
    expect(
      getSendVacancyResponseError({
        status: 400,
        error: { nonFieldErrors: ["Участник проекта не может откликнуться на его вакансию."] },
      }),
    ).toBe("Нельзя откликнуться на вакансию проекта, в котором вы уже участвуете");
  });

  it("не показывает сырой текст неизвестной или server error", () => {
    expect(getSendVacancyResponseError({ status: 500, error: "error" })).toBe(
      "Не удалось отправить отклик. Попробуйте ещё раз",
    );
  });

  it("показывает состояние недоступной вакансии", () => {
    expect(
      getSendVacancyResponseError({
        status: 400,
        error: ["На эту вакансию больше нельзя откликнуться."],
      }),
    ).toBe("На эту вакансию больше нельзя откликнуться");
  });

  it.each([
    [403, "forbidden"],
    [404, "not_found"],
    [0, "load_error"],
    [500, "load_error"],
  ] as const)("мапит HTTP %s в %s", (status, expected) => {
    expect(getVacancyResponsesLoadError({ status })).toBe(expected);
  });
});
