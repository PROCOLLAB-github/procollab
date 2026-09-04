/** @format */

import { signal } from "@angular/core";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL, PRODUCTION } from "@corelib";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { provideNgxMask } from "ngx-mask";
import { of } from "rxjs";
import { ProfileFormService } from "@api/profile/facades/edit/profile-form.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { SearchesService } from "@api/searches/searches.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { User } from "@domain/auth/user.model";
import { ProfileMainStepComponent } from "./profile-main-step.component";

describe("ProfileMainStepComponent user region", () => {
  let fixture: ComponentFixture<ProfileMainStepComponent>;
  let formService: ProfileFormService;
  const profile = signal<User | null>(null);
  const auth = { updateProfile: vi.fn(), updateAvatar: vi.fn() };

  beforeEach(async () => {
    profile.set(null);
    auth.updateProfile.mockReset().mockReturnValue(of({}));
    auth.updateAvatar.mockReset().mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [ProfileMainStepComponent, HttpClientTestingModule],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        { provide: API_URL, useValue: "" },
        { provide: PRODUCTION, useValue: false },
        ProfileFormService,
        { provide: AuthRepositoryPort, useValue: auth },
        {
          provide: ProfileInfoService,
          useValue: { profile, changeableRoles: signal([]), applyProfileUpdated: vi.fn() },
        },
        { provide: SearchesService, useValue: { inlineSpecs: signal([]), onSearchSpec: vi.fn() } },
      ],
    }).compileComponents();
    formService = TestBed.inject(ProfileFormService);
    fixture = TestBed.createComponent(ProfileMainStepComponent);
    fixture.autoDetectChanges();
  });

  const input = (): HTMLInputElement =>
    fixture.nativeElement.querySelector('app-region-select input[role="combobox"]');

  const load = async (city: string) => {
    profile.set({
      id: 42,
      firstName: "Иван",
      lastName: "Иванов",
      email: "user@example.test",
      personal: { city, birthday: "1990-03-25", userType: 1, links: [] },
      relations: {
        skills: [],
        workExperience: [],
        education: [],
        userLanguages: [],
        achievements: [],
      },
      roles: { member: { usefulToProject: "" } },
    } as unknown as User);
    formService.initializeProfileData();
    await vi.waitFor(() => expect(formService.profileId()).toBe(42));
    await fixture.whenStable();
  };

  const type = async (query: string) => {
    input().value = query;
    input().dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
  };

  it("loads canonical city as selected user region without API side effects", async () => {
    await load("Москва");
    expect(input().value).toBe("Москва");
    expect(input().getAttribute("aria-label")).toBe("Регион пользователя");
    expect(fixture.nativeElement.querySelector('label[for="city"]').textContent).toBe("Регион");
    expect(fixture.nativeElement.querySelector('app-input[formcontrolname="city"]')).toBeNull();
    expect(formService.city.value).toBe("Москва");
    expect(auth.updateProfile).not.toHaveBeenCalled();
    expect(auth.updateAvatar).not.toHaveBeenCalled();
  });

  it.each(["Набережные Челны", "Мсква", "moscow"])(
    "preserves untouched legacy city %s through focus, blur and Escape",
    async city => {
      await load(city);
      const changed = vi.fn();
      const subscription = formService.city.valueChanges.subscribe(changed);
      input().dispatchEvent(new FocusEvent("focus"));
      input().dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
      await fixture.whenStable();
      expect(formService.city.value).toBe(city);
      input().dispatchEvent(new FocusEvent("focus"));
      input().dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      await fixture.whenStable();
      expect(input().value).toBe(city);
      expect(formService.city.value).toBe(city);
      expect(fixture.nativeElement.querySelector(".region-select__legacy").textContent).toContain(
        city,
      );
      expect(changed).not.toHaveBeenCalled();
      expect(auth.updateProfile).not.toHaveBeenCalled();
      subscription.unsubscribe();
    },
  );

  it("clears legacy on search, ranks Moscow first and commits only an option to city", async () => {
    await load("Набережные Челны");
    await type("моск");
    expect(formService.city.value).toBe("");
    expect(formService.city.hasError("required")).toBe(true);
    expect(input().value).toBe("моск");
    const options = Array.from(
      fixture.nativeElement.querySelectorAll('[role="option"] button'),
    ) as HTMLButtonElement[];
    expect(options.map(option => option.textContent?.trim()).slice(0, 2)).toEqual([
      "Москва",
      "Московская область",
    ]);
    options[0].click();
    await fixture.whenStable();
    expect(formService.city.value).toBe("Москва");
    expect(input().value).toBe("Москва");
    expect(formService.getForm().get("region")).toBeNull();
  });

  it("does not persist an arbitrary query or a hidden old selection", async () => {
    await load("Москва");
    await type("абвгд");
    expect(input().value).toBe("абвгд");
    expect(formService.city.value).toBe("");
    expect(formService.city.invalid).toBe(true);
    expect(fixture.nativeElement.querySelector(".region-select__empty").textContent).toContain(
      "Ничего не найдено",
    );
    input().dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    await fixture.whenStable();
    expect(formService.city.value).toBe("");
  });
});
