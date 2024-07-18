/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import linkifyStr from "linkify-string";

@Pipe({
  name: "parseLinks",
  standalone: true,
})
export class ParseLinksPipe implements PipeTransform {
  transform(string: string): string {
    return linkifyStr(string);
  }
}
