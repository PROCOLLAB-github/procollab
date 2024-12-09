/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "salaryTransform",
  standalone: true,
})
export class SalaryTransformPipe implements PipeTransform {
  transform(value: string): string {
    const numberValue = parseInt(value, 10);
    if (isNaN(numberValue)) {
      return value;
    }
    return numberValue.toLocaleString("ru-RU");
  }
}
