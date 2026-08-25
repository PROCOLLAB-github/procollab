/** @format */

import { TestBed } from "@angular/core/testing";
import { AnalyticsService } from "@api/analytics/analytics.service";
import { CookieConsentComponent } from "./cookie-consent.component";

describe("CookieConsentComponent", () => {
  let analyticsService: { loadAnalytics: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();
    analyticsService = { loadAnalytics: vi.fn() };
    TestBed.configureTestingModule({
      imports: [CookieConsentComponent],
      providers: [{ provide: AnalyticsService, useValue: analyticsService }],
    });
  });

  afterEach(() => localStorage.clear());

  function createComponent(): CookieConsentComponent {
    const fixture = TestBed.createComponent(CookieConsentComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it("показывает баннер, если решение ещё не сохранено", () => {
    expect(createComponent().visible).toBe(true);
  });

  it("не показывает баннер повторно после согласия", () => {
    localStorage.setItem("cookieConsent", "accepted");

    expect(createComponent().visible).toBe(false);
    expect(analyticsService.loadAnalytics).toHaveBeenCalledOnce();
  });

  it("не показывает баннер повторно после отказа", () => {
    localStorage.setItem("cookieConsent", "declined");

    expect(createComponent().visible).toBe(false);
    expect(analyticsService.loadAnalytics).not.toHaveBeenCalled();
  });

  it("сохраняет согласие одним действием и подключает аналитику", () => {
    const component = createComponent();

    component.confirm();

    expect(localStorage.getItem("cookieConsent")).toBe("accepted");
    expect(component.visible).toBe(false);
    expect(analyticsService.loadAnalytics).toHaveBeenCalledOnce();
  });

  it("сохраняет отказ без блокировки платформы и аналитики", () => {
    const component = createComponent();

    component.decline();

    expect(localStorage.getItem("cookieConsent")).toBe("declined");
    expect(component.visible).toBe(false);
    expect(analyticsService.loadAnalytics).not.toHaveBeenCalled();
  });
});
