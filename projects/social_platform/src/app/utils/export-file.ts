/** @format */

/**
 * Сохраняет blob файл на диск пользователя
 * @param blob - Blob объект с данными файла
 * @param fileName - Имя файла для сохранения (по умолчанию 'export.xlsx')
 */
import { saveAs } from "file-saver";

export const saveFile = (
  blob: Blob,
  type: "all" | "submitted" | "rates" | "cv",
  name?: string
): void => {
  const prefixFileName =
    type === "all" ? "projects" : type === "rates" ? "scores" : "projects_review";
  const todayDate = new Date().toLocaleDateString("ru-RU");
  const fullName =
    (type !== "cv" ? prefixFileName + "-" : "") +
    name +
    (type !== "cv" ? "-" + todayDate + ".xlsx" : ".pdf");
  saveAs(blob, fullName);
};
