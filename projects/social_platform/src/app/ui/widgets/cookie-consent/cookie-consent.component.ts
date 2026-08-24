/** @format */

import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { AnalyticsService } from "@api/analytics/analytics.service";
import { ButtonComponent } from "@ui/primitives";

/** Виджет согласия на cookie. */
@Component({
  selector: "app-cookie-consent",
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.scss",
  imports: [ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieConsentComponent implements OnInit {
  visible = false;

  private readonly storageKey = "cookieConsent";

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    const consent = localStorage.getItem(this.storageKey);

    if (consent === "accepted") {
      this.analyticsService.loadAnalytics();
    } else if (consent !== "declined") {
      this.visible = true;
    }
  }

  confirm(): void {
    localStorage.setItem(this.storageKey, "accepted");
    this.analyticsService.loadAnalytics();
    this.visible = false;
  }

  decline(): void {
    localStorage.setItem(this.storageKey, "declined");
    this.visible = false;
  }
}
