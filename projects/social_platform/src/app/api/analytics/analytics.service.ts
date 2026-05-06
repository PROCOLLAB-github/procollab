/** @format */

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AnalyticsService {
  private loaded = false;

  loadAnalytics(): void {
    if (this.loaded) return;
    if (window.location.hostname !== "app.procollab.ru") return;

    this.loaded = true;
    this.loadYandexMetrika();
    this.loadMailRuCounter("3622531");

    if (window.location.href === "https://app.procollab.ru/auth/register") {
      this.loadMailRuCounter("3543687");
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

    w.ym(91871365, "init", {
      clickmap: true,
      trackLinks: true,
      accurateTrackBounce: true,
      webvisor: true,
      trackHash: true,
    });
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
