/** @format */

import { Project } from "@office/models/project.model";

export interface DashboardItem {
  sectionName: string;
  title: string;
  iconName: string;
  arrayItems: Project[];
}

export const dashboardItemBuilder = (
  amount: number,
  sections: string[],
  titles: string[],
  icons: string[],
  arrays: Project[][]
): DashboardItem[] => {
  if (amount <= 0) return [];

  const minLength = Math.min(sections.length, titles.length, icons.length, arrays.length);
  const actualAmount = Math.min(amount, minLength);

  return Array.from({ length: actualAmount }, (_, i) => ({
    sectionName: sections[i],
    title: titles[i],
    iconName: icons[i],
    arrayItems: arrays[i],
  }));
};
