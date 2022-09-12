/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import * as dayjs from "dayjs";
import * as relativeTime from "dayjs/plugin/relativeTime";
import * as isToday from "dayjs/plugin/isToday";
import "dayjs/locale/ru";

dayjs.extend(relativeTime);
dayjs.extend(isToday);

@Pipe({
  name: "dayjs",
})
export class DayjsPipe implements PipeTransform {
  constructor() {
    dayjs.locale("ru");
  }

  transform(value: any, type: string, options?: any): string | number | boolean {
    switch (type) {
      case "toX":
        return dayjs().to(dayjs(value), true);
      case "diffDay":
        return dayjs(value).diff(dayjs(), "day");
      case "diffHour":
        return dayjs(value).diff(dayjs(), "hour");
      case "isToday":
        return dayjs(value).isToday();
      case "fromX":
        return dayjs(value).from(dayjs(), true);
      case "format":
        return dayjs(value).format(options);
      default:
        throw new Error(`Invalid action type specified: ${type}`);
    }
  }
}
