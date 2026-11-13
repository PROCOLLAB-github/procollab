/** @format */
import { DOCUMENT } from "@angular/common";
import { inject, Injectable } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { InstanceInfoService } from "@api/instance/instance-info.service";

@Injectable({ providedIn: "root" })
export class InstanceBrandService {
  private readonly instance = inject(InstanceInfoService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  async initialize(): Promise<void> {
    await this.instance.initialize(this.document.location.origin);
    if (this.instance.error()) {
      this.title.setTitle("Пилот кейс-чемпионата");
      return;
    }
    if (!this.instance.enabled()) return;
    this.title.setTitle(this.instance.name());
    this.meta.updateTag({ name: "robots", content: "noindex, nofollow" });
    if (this.instance.favicon()) {
      let icon = this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
      if (!icon) {
        icon = this.document.createElement("link");
        icon.rel = "icon";
        this.document.head.appendChild(icon);
      }
      icon.href = this.instance.favicon();
      icon.removeAttribute("type");
    }
  }
}
