/** @format */

import { Project } from "@domain/project/project.model";

export interface DashboardItem<TItem = Project> {
  sectionName: string;
  title: string;
  iconName: string;
  arrayItems: TItem[];
}

export const dashboardItemBuilder = <TItem = Project>(
  amount: number,
  sections: string[],
  titles: string[],
  icons: string[],
  arrays: TItem[][],
): DashboardItem<TItem>[] => {
  if (amount <= 0) return [];

  return Array.from({ length: amount }, (_, i) => ({
    sectionName: sections[i],
    title: titles[i],
    iconName: icons[i],
    arrayItems: arrays[i],
  }));
};
