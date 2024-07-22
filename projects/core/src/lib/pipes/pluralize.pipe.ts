/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "pluralize",
  standalone: true,
})
export class PluralizePipe implements PipeTransform {
  transform(value: number, words: [string, string, string]): string {
    const calcValue = Math.abs(value) % 100;
    const num = calcValue % 10;

    if (calcValue > 10 && calcValue < 20) return words[2];
    if (num > 1 && num < 5) return words[1];
    if (num === 1) return words[0];
    return words[2];
  }
}
