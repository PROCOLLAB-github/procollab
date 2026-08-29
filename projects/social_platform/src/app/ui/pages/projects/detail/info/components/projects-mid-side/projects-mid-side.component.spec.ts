/** @format */

import { buildProjectDescriptionPreview } from "./projects-mid-side.component";

describe("buildProjectDescriptionPreview", () => {
  it("не обрезает короткое описание", () => {
    expect(buildProjectDescriptionPreview("Короткое описание.", 100)).toBe("Короткое описание.");
  });

  it("обрезает длинное описание по границе целого предложения", () => {
    const description =
      "Первое законченное предложение. Второе законченное предложение. Третье предложение продолжается.";

    expect(buildProjectDescriptionPreview(description, 70)).toBe(
      "Первое законченное предложение. Второе законченное предложение.",
    );
  });

  it("использует границу слова и многоточие, если законченного предложения нет", () => {
    expect(buildProjectDescriptionPreview("Очень длинное описание без знаков завершения", 28)).toBe(
      "Очень длинное описание без…",
    );
  });
});
