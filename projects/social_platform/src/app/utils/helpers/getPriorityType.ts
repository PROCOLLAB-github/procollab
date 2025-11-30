/** @format */

import { priorityInfoList } from "projects/core/src/consts/lists/priority-info-list.const";
import { hexToRgba } from "./hexToRgba";

export const getPriorityType = (
  priorityId: number,
  type: "background" | "color",
  opacity = 0.25
) => {
  const findedPriority = priorityInfoList.find(priority => priority.priorityType === priorityId);
  const baseColor = findedPriority?.color ?? "var(--light-white)";

  if (!findedPriority) return;

  if (type === "color") {
    return { "background-color": baseColor };
  }

  const rgbaColor = hexToRgba(baseColor, opacity);
  return { "background-color": rgbaColor };
};
