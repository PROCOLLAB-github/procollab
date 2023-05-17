/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "userLinks",
})
export class UserLinksPipe implements PipeTransform {
  icons: Record<string, string> = {
    "t.me": "telegram",
    "vk.com": "vk",
  };

  transform(value: string): { iconName: string; tag: string } {
    const url = new URL(value);
    let domain = url.hostname;
    domain = domain.split(".").slice(-2).join(".");

    const tag = url.pathname.replace(/\//g, "");

    return { iconName: this.icons[domain], tag };
  }
}
