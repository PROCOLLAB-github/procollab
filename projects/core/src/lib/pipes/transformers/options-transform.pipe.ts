/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "toSelectOptions",
  standalone: true,
})
export class ToSelectOptionsPipe implements PipeTransform {
  transform(
    values: string[] | null | undefined
  ): { value: string | number; label: string; id: number }[] {
    if (!values || !Array.isArray(values)) {
      return [];
    }

    return values.map((value, index) => ({
      value,
      label: value,
      id: index,
    }));
  }
}
