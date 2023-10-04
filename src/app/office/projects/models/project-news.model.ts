/** @format */
import * as dayjs from "dayjs";
import { FileModel } from "@models/file.model";

export class ProjectNews {
  id!: number;
  name!: string;
  imageAddress!: string;
  text!: string;
  datetimeCreated!: string;
  datetimeUpdated!: string;
  viewsCount!: number;
  likesCount!: number;
  files!: FileModel[];
  isUserLiked!: boolean;

  static default(): ProjectNews {
    return {
      id: 13,
      name: "w98ef",
      imageAddress:
        "https://api.selcdn.ru/v1/SEL_228194/procollab_static/6043715490745844423/9115169748862337773.jpg",
      files: [FileModel.default()],
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
