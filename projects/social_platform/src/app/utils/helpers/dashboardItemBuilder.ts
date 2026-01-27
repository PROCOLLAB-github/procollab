/** @format */

import { Project } from "../../domain/project/project.model";

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

  return Array.from({ length: amount }, (_, i) => ({
    sectionName: sections[i],
    title: titles[i],
    iconName: icons[i],
    arrayItems: arrays[i],
  }));
};
