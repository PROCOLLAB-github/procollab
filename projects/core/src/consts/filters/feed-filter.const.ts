/** @format */

export const feedFilter = [
  {
    name: "все новости",
    value: "",
    icon: "feed",
    apiType: "all_news",
    countKey: "allNews",
  },
  {
    name: "новости проектов",
    value: "project",
    icon: "projects",
    apiType: "project_news",
    countKey: "projectNews",
  },
  {
    name: "новости сообщества",
    value: "news",
    icon: "people-bold",
    apiType: "news",
    countKey: "news",
  },
  {
    name: "свежие вакансии",
    value: "vacancy",
    icon: "suitcase",
    apiType: "vacancy",
    countKey: "vacancy",
  },
  {
    name: "новые проекты",
    value: "new_project",
    icon: "projects",
    apiType: "new_project",
    countKey: "newProject",
  },
  {
    name: "новости программ",
    value: "partnerprogram",
    icon: "procollab",
    apiType: "partnerprogram",
    countKey: "partnerprogram",
  },
] as const;

export function getFeedFilter(includes: unknown) {
  return feedFilter.find(filter => filter.value === includes) ?? feedFilter[0];
}
