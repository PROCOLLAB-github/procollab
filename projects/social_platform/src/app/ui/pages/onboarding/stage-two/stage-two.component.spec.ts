/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { OverlayContainer } from "@angular/cdk/overlay";

import { OnboardingStageTwoComponent } from "./stage-two.component";
import { BehaviorSubject, of, Subject } from "rxjs";
import { ReactiveFormsModule } from "@angular/forms";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { SkillsRepositoryPort } from "@domain/skills/ports/skills.repository.port";
import { SpecializationsRepositoryPort } from "@domain/specializations/ports/specializations.repository.port";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { OnboardingService } from "@api/onboarding/onboarding.service";
import { ProfileInfoService } from "@api/profile/facades/profile-info.service";
import { signal } from "@angular/core";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { UserInput } from "@domain/auth/user.model";
import { Skill } from "@domain/skills/skill.model";
import { OnboardingStageTwoUIInfoService } from "@api/onboarding/facades/stages/ui/onboarding-stage-two-ui-info.service";

describe("StageTwoComponent", () => {
  let component: OnboardingStageTwoComponent;
  let fixture: ComponentFixture<OnboardingStageTwoComponent>;
  let draft: BehaviorSubject<UserInput>;
  let results: Subject<any>;
  let getSkillsInline: ReturnType<typeof vi.fn>;
  let setFormValue: ReturnType<typeof vi.fn>;
  const angular: Skill = {
    id: 1,
    name: "Angular",
    category: { id: 1, name: "Front-end" },
    approves: [],
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    draft = new BehaviorSubject<UserInput>({});
    results = new Subject();
    getSkillsInline = vi.fn(() => results.asObservable());
    setFormValue = vi.fn((value: UserInput) => {
      // Ограничитель делает регрессию цикла draft -> form -> draft безопасной для runner.
      if (setFormValue.mock.calls.length <= 5) draft.next({ ...draft.value, ...value });
    });
    const authSpy = {
      profile: of({}),
      saveProfile: of({}),
      setOnboardingStage: of({}),
    };

    const authPortSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      updateProfile: of({}),
    };

    const skillsSpy = {
      getSkillsNested: () => of([]),
      getSkillsInline,
    };

    const specializationsSpy = {
      getSpecializationsNested: () => of([]),
      getSpecializationsInline: () => of({ count: 0, results: [], next: "", previous: "" }),
    };

    const onboardingSpy = { formValue$: draft.asObservable(), setFormValue };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, OnboardingStageTwoComponent],
      providers: [
        { provide: AuthRepository, useValue: authSpy },
        { provide: AuthRepositoryPort, useValue: authPortSpy },
        { provide: SkillsRepositoryPort, useValue: skillsSpy },
        { provide: SpecializationsRepositoryPort, useValue: specializationsSpy },
        { provide: OnboardingService, useValue: onboardingSpy },
        { provide: ProfileInfoService, useValue: { profile: signal(null) } },
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OnboardingStageTwoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  afterEach(() => {
    fixture.destroy();
    TestBed.inject(OverlayContainer).ngOnDestroy();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  function type(query: string): void {
    const input: HTMLInputElement = fixture.nativeElement.querySelector(
      "app-autocomplete-input input",
    );
    input.value = query;
    input.dispatchEvent(new Event("input"));
    fixture.detectChanges();
    vi.advanceTimersByTime(300);
  }

  it("показывает ответ поиска в настоящем Autocomplete и добавляет выбранный навык без дубля", () => {
    type("Angular");
    expect(getSkillsInline).toHaveBeenCalledWith("Angular", 1000, 0);
    results.next({ count: 1, results: [angular], next: "", previous: "" });
    fixture.detectChanges();
    const option: HTMLElement = TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector(".field__dropdown--options .field__option");
    expect(option?.textContent).toContain("Angular");
    option.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector("input").value).toBe("");
    expect(fixture.nativeElement.querySelectorAll(".basket__skill")).toHaveLength(1);
    type("Angular");
    results.next({ count: 1, results: [angular], next: "", previous: "" });
    fixture.detectChanges();
    TestBed.inject(OverlayContainer)
      .getContainerElement()
      .querySelector<HTMLElement>(".field__dropdown--options .field__option")!
      .click();
    fixture.detectChanges();
    expect(getSkillsInline).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelectorAll(".basket__skill")).toHaveLength(1);
  });

  it("пустой черновик допускает выбор и снятие навыка из библиотеки", () => {
    const ui = fixture.debugElement.injector.get(OnboardingStageTwoUIInfoService);
    expect(ui.stageForm.controls.skills.value).toEqual([]);
    component.onOptionToggled(angular);
    fixture.detectChanges();
    expect(ui.stageForm.controls.skills.value).toEqual([angular]);
    component.onOptionToggled(angular);
    fixture.detectChanges();
    expect(ui.stageForm.controls.skills.value).toEqual([]);
  });

  it("синхронизация черновика и формы не создаёт обратный цикл", () => {
    expect(setFormValue).not.toHaveBeenCalled();
    component.onAddSkill(angular);
    expect(setFormValue).toHaveBeenCalledTimes(1);
    expect(draft.value.skills).toEqual([angular]);
    draft.next({ skills: [] });
    fixture.detectChanges();
    expect(setFormValue).toHaveBeenCalledTimes(1);
    expect(fixture.nativeElement.querySelectorAll(".basket__skill")).toHaveLength(0);
  });
});
