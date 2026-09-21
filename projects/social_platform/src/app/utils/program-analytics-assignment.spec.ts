/** @format */
import { criterion } from "@domain/program/program-analytics-assignment.fixture";
import {
  assignmentCriterionValue,
  assignmentStatusLabels,
  formatAssignmentWaiting,
} from "./program-analytics-assignment";

describe("Assignment presentation", () => {
  it.each([
    [0, "< 1 ч"],
    [1800, "< 1 ч"],
    [25200, "7 ч"],
    [86400, "1 д 0 ч"],
    [108000, "1 д 6 ч"],
    [187200, "2 д 4 ч"],
  ])("форматирует %s секунд как %s", (seconds, label) => {
    expect(formatAssignmentWaiting(Number(seconds))).toBe(label);
  });
  it("не подменяет неизвестное ожидание нулём", () => {
    expect(formatAssignmentWaiting(null)).toBe("Нет данных");
    expect(formatAssignmentWaiting(null, "not_ready")).toBe("Проект не сдан");
    expect(formatAssignmentWaiting(null, "completed")).toBe("—");
  });
  it("отображает серверные статусы без расчёта на клиенте", () => {
    expect(Object.values(assignmentStatusLabels)).toEqual([
      "Проект не сдан",
      "Не начал оценивание",
      "В процессе",
      "Выполнено",
    ]);
  });
  it("различает numeric, bool, text, unscored и сохранённое пустое значение", () => {
    expect(assignmentCriterionValue(criterion({ value: "0" }))).toBe("0");
    expect(assignmentCriterionValue(criterion({ type: "bool", value: "True" }))).toBe("Да");
    expect(assignmentCriterionValue(criterion({ type: "bool", value: "False" }))).toBe("Нет");
    expect(assignmentCriterionValue(criterion({ type: "str", value: " Текст " }))).toBe(" Текст ");
    expect(assignmentCriterionValue(criterion({ isScored: false }))).toBe("Не оценено");
    expect(assignmentCriterionValue(criterion({ value: null }))).toBe("Пустое значение");
  });
});
