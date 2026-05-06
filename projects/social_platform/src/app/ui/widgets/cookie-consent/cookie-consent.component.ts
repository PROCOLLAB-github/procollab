/** @format */

import { Component, OnInit } from "@angular/core";
import { AnalyticsService } from "@api/analytics/analytics.service";
import { ButtonComponent, CheckboxComponent } from "@ui/primitives";

@Component({
  selector: "app-cookie-consent",
  templateUrl: "./cookie-consent.component.html",
  styleUrl: "./cookie-consent.component.scss",
  standalone: true,
  imports: [CheckboxComponent, ButtonComponent],
})
export class CookieConsentComponent implements OnInit {
  visible = false;
  accepted = false;

  private readonly storageKey = "cookieConsent";

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    const consent = localStorage.getItem(this.storageKey);

    if (consent === "accepted") {
      this.analyticsService.loadAnalytics();
    } else {
      this.visible = true;
    }
  }

  onAcceptedChange(value: boolean): void {
    this.accepted = value;
  }

  confirm(): void {
    if (!this.accepted) return;

    localStorage.setItem(this.storageKey, "accepted");
    this.analyticsService.loadAnalytics();
    this.visible = false;
  }

  decline(): void {
    localStorage.setItem(this.storageKey, "declined");
    this.visible = false;
  }
}
