/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { API_URL, PRODUCTION } from "@corelib";

import { OnboardingStageZeroComponent } from "./stage-zero.component";
import { of } from "rxjs";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ReactiveFormsModule } from "@angular/forms";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { ProjectSubscriptionRepositoryPort } from "@domain/project/ports/project-subscription.repository.port";
import { User } from "@domain/auth/user.model";
import { OnboardingStageZeroUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-zero-ui-info.service";

describe("StageZeroComponent", () => {
  let component: OnboardingStageZeroComponent;
  let fixture: ComponentFixture<OnboardingStageZeroComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, OnboardingStageZeroComponent],
      providers: [
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        {
          provide: ProjectSubscriptionRepositoryPort,
          useValue: { getSubscriptions: of({ results: [], count: 0 }) },
        },
        provideNgxMask(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageZeroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  const loadRegion = (city: string) => {
    const ui = fixture.debugElement.injector.get(OnboardingStageZeroUIInfoService);
    ui.applySetProfile({ firstName: "Иван", lastName: "Иванов" } as User);
    ui.applyInitFormValues({ city });
    fixture.detectChanges();
    return ui.stageForm.controls.city;
  };

  it("uses the shared user region combobox and keeps the city control", () => {
    const city = loadRegion("Москва");
    const input = fixture.nativeElement.querySelector(
      'app-region-select input[role="combobox"]',
    ) as HTMLInputElement;
    expect(input.getAttribute("aria-label")).toBe("Регион пользователя");
    expect(input.value).toBe("Москва");
    expect(fixture.nativeElement.querySelector('label[for="city"]').textContent).toBe("Регион*");
    input.value = "татар";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(city.value).toBe("");
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    fixture.detectChanges();
    expect(city.value).toBe("Республика Татарстан");
  });

  it("preserves an initial legacy city without automatically selecting a region", () => {
    const city = loadRegion("Набережные Челны");
    const input = fixture.nativeElement.querySelector(
      "app-region-select input",
    ) as HTMLInputElement;
    input.dispatchEvent(new FocusEvent("focus"));
    input.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    input.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
    fixture.detectChanges();
    expect(city.value).toBe("Набережные Челны");
    expect(fixture.nativeElement.querySelector(".region-select__legacy").textContent).toContain(
      "Набережные Челны",
    );
    input.value = "абвгд";
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    expect(city.value).toBe("");
    expect(city.invalid).toBe(true);
  });
});
