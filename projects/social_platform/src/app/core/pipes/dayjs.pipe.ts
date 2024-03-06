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
    standalone: true,
})
export class DayjsPipe implements PipeTransform {
  constructor() {
    dayjs.locale("ru");
  }

  transform(value: any, type: string, options?: any): string | number | boolean {
    if (type === "toX") {
      return dayjs().to(dayjs(value), true);
    } else if (type === "diffDay") {
      return dayjs(value).diff(dayjs(), "day");
    } else if (type === "diffHour") {
      return dayjs(value).diff(dayjs(), "hour");
    } else if (type === "isToday") {
      return dayjs(value).isToday();
    } else if (type === "fromX") {
      return dayjs(value).from(dayjs(), true);
    } else if (type === "format") {
      return dayjs(value).format(options);
    } else {
      throw new Error(`Invalid action type specified: ${type}`);
    }
  }
}
