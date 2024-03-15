/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import { PluralizePipe } from "projects/core";
import * as RelativeTime from "dayjs/plugin/relativeTime";
import * as dayjs from "dayjs";

dayjs.extend(RelativeTime);

@Pipe({
  name: "yearsFromBirthday",
  standalone: true,
})
export class YearsFromBirthdayPipe implements PipeTransform {
  transform(value: string): string {
    const years = Math.floor(dayjs().diff(dayjs(value), "year", true));

    const pluralize = new PluralizePipe();
    return `${years} ${pluralize.transform(years, ["год", "года", "лет"])}`;
  }
}
