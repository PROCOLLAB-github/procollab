/** @format */
import * as dayjs from "dayjs";

export class ProjectNews {
  id!: number;
  projectName!: string;
  projectImageAddress!: string;
  text!: string;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  viewsCount!: number;
  likesCount!: number;
  files!: string[];
  isUserLiked!: boolean;

  static default(): ProjectNews {
    return {
      id: 13,
      projectName: "w98ef",
      projectImageAddress:
        "https://api.selcdn.ru/v1/SEL_228194/procollab_static/6043715490745844423/9115169748862337773.jpg",
      files: [
        "https://api.selcdn.ru/v1/SEL_228194/procollab_static/6043715490745844423/9115169748862337773.jpg",
        "https://api.selcdn.ru/v1/SEL_228194/procollab_static/6043715490745844423/9115169748862337773.jpg",
        "https://api.selcdn.ru/v1/SEL_228194/procollab_static/6043715490745844423/9115169748862337773.jpg",
      ],
      text: "so8df",
      datetimeCreated: dayjs().format(),
      datetimeUpdated: dayjs().format(),
      viewsCount: 234,
      likesCount: 234,
      isUserLiked: true,
    };
  }
}

export class ProjectNewsRes {
  results!: ProjectNews[];
  count!: number;
  next!: string;
  previous!: string;
}