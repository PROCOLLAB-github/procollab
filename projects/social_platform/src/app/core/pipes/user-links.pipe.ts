/** @format */

import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "userLinks",
  standalone: true,
})
export class UserLinksPipe implements PipeTransform {
  icons: Record<string, string> = {
    "t.me": "telegram",
    "vk.com": "vk",
  };

  transform(value: string): { iconName: string; tag: string } {
    if (!this.checkValidUrl(value)) {
      if (this.checkEmail(value)) return { iconName: "email", tag: value };
      else return { iconName: "", tag: value };
    }

    const url = new URL(value);
    let domain = url.hostname;
    domain = domain.split(".").slice(-2).join(".");

    let tag = url.pathname;
    if (tag.split("/").filter(Boolean).length > 1 || !this.icons[domain]) {
      tag = value;
    } else {
      tag = "@" + tag.replace(/\//g, "");
    }

    return { iconName: this.icons[domain] ?? "link", tag };
  }

  private checkValidUrl(url: string): boolean {
    try {
      return !!new URL(url);
    } catch (err) {
      return false;
    }
  }

  private checkEmail(url: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(url);
  }
}
