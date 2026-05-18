/** @format */

import { Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private loaded = false;
  private readonly ANALYTICS_HOST = environment.analyticsHost;

  loadAnalytics(): void {
    if (this.loaded) return;
    if (window.location.hostname !== this.ANALYTICS_HOST) return;

    this.loaded = true;
    this.loadYandexMetrika();
    if (environment.mailRuCounterId) this.loadMailRuCounter(environment.mailRuCounterId);

    if (
      environment.registerPath &&
      window.location.pathname === environment.registerPath &&
      environment.mailRuRegisterId
    ) {
      this.loadMailRuCounter(environment.mailRuRegisterId);
    }
  }

  private loadYandexMetrika(): void {
    const w = window as any;
    w.ym =
      w.ym ||
      function (...args: any[]) {
        (w.ym.a = w.ym.a || []).push(args);
      };
    w.ym.l = new Date().getTime();

    const script = document.createElement("script");
    script.async = true;
    script.src = "https://cdn.jsdelivr.net/npm/yandex-metrica-watch/tag.js";
    document.head.appendChild(script);

    const id = environment.yandexMetrikaId;
    if (id) {
      w.ym(id, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
        trackHash: true,
      });
    }
  }

  private loadMailRuCounter(id: string): void {
    const w = window as any;
    const tmr = (w._tmr = w._tmr || []);
    tmr.push({ id, type: "pageView", start: new Date().getTime() });

    if (document.getElementById("tmr-code")) return;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.id = "tmr-code";
    script.src = "https://top-fwz1.mail.ru/js/code.js";
    document.head.appendChild(script);
  }
}
