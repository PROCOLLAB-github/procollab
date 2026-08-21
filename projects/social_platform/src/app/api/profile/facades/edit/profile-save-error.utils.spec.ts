/** @format */

import { resolveProfileSaveErrorText } from "./profile-save-error.utils";

describe("profile save error utils", () => {
  it("should parse birthday response", () => {
    expect(
      resolveProfileSaveErrorText({
        error: {
          birthday: ["Age must be between 12 and 99"],
        },
      }),
    ).toBe("Дата рождения: возраст должен быть от 12 до 99 лет");
  });

  it("should parse nested education errors without hardcoded index", () => {
    expect(
      resolveProfileSaveErrorText({
        error: {
          education: [{}, { entry_year: ["Start year must be before finish year"] }],
        },
      }),
    ).toBe("Образование #2: год начала: год начала должен быть меньше или равен году окончания");
  });

  it("should parse nested work experience errors without hardcoded index", () => {
    expect(
      resolveProfileSaveErrorText({
        error: {
          work_experience: [{}, {}, { completion_year: ["This field is required."] }],
        },
      }),
    ).toBe("Опыт работы #3: год окончания: поле обязательно для заполнения");
  });

  it("should parse nested achievement errors without hardcoded index", () => {
    expect(
      resolveProfileSaveErrorText({
        error: {
          achievements: [{}, { title: ["This field may not be blank."] }],
        },
      }),
    ).toBe("Достижение #2: название: поле не должно быть пустым");
  });

  it("should return generic text only for unparseable response", () => {
    expect(resolveProfileSaveErrorText()).toBe("Ошибка при сохранении профиля");
  });
});
