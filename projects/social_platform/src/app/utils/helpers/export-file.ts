/** @format */

/**
 * Сохраняет blob файл на диск пользователя
 * @param blob - Blob объект с данными файла
 * @param fileName - Имя файла для сохранения (по умолчанию 'export.xlsx')
 */
import { saveAs } from "file-saver";

export const saveFile = (
  programName: string,
  blob: Blob,
  type: "all" | "submitted" | "rates"
): void => {
  const prefixFileName =
    type === "all" ? "projects" : type === "rates" ? "scores" : "projects_review";
  const todayDate = new Date().toLocaleDateString("ru-RU");
  const fullName = prefixFileName + "-" + programName + "-" + todayDate + ".xlsx";
  saveAs(blob, fullName);
};
