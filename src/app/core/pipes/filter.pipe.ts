/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "filter",
})
export class FilterPipe implements PipeTransform {
  transform<T>(value: T[], callback: (val: T) => boolean): T[] {
    return value.filter(callback);
  }
}
