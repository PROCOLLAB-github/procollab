/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "parseBreaks",
})
export class ParseBreaksPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/\n/g, "<br>");
  }
}
