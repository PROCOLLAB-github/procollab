/** @format */

import { Pipe } from "@angular/core";

@Pipe({
  name: "capitalize",
  standalone: true,
})
export class CapitalizePipe {
  transform(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
