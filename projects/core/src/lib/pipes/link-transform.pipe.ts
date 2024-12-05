/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "linkTransform",
  standalone: true,
})
export class LinkTransformPipe implements PipeTransform {
  transform(value: string) {
    if (!value) {
      return "";
    }

    const httpsPrefix = "https://";
    const startIndex = value.indexOf(httpsPrefix);

    if (startIndex === -1) {
      return "";
    }

    const domainStartIndex = startIndex + httpsPrefix.length;
    const domainEndIndex = value.indexOf(".", domainStartIndex);

    if (domainEndIndex === -1) {
      return value.substring(domainStartIndex);
    }

    return value.substring(domainStartIndex, domainEndIndex);
  }
}
