/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { VacancyCardComponent } from "./vacancy-card.component";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { of } from "rxjs";
import { provideRouter } from "@angular/router";

describe("VacancyCardComponent", () => {
  let component: VacancyCardComponent;
  let fixture: ComponentFixture<VacancyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VacancyCardComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        {
          provide: AuthRepositoryPort,
          useValue: {
            fetchProfile: () => of({}),
            fetchUserRoles: () => of([]),
            fetchChangeableRoles: () => of([]),
            fetchLeaderProjects: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("vacancy", createVacancy(true));
    fixture.detectChanges();
  });

  function createVacancy(isActive: boolean) {
    return {
      id: 1,
      role: "Test Vacancy",
      description: "",
      requiredSkills: [],
      isActive,
    };
  }

  it("показывает архив, историю и действие возврата в управляемой карточке", () => {
    fixture.componentRef.setInput("manageLifecycle", true);
    fixture.componentRef.setInput("vacancy", { ...createVacancy(false), totalResponseCount: 4 });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain("В архиве");
    expect(fixture.nativeElement.textContent).toContain("Вернуть в активные");
    expect(fixture.nativeElement.querySelector(".vacancy__responses").textContent).toContain("4");
    const changed = vi.fn();
    component.changeStatus.subscribe(changed);
    fixture.nativeElement.querySelectorAll(".vacancy__actions button")[1].click();
    expect(changed).toHaveBeenCalledWith(1);
  });

  it("не подменяет неизвестное число откликов нулем", () => {
    fixture.componentRef.setInput("manageLifecycle", true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector(".vacancy__responses").textContent).toContain(
      "Вакансия и отклики",
    );
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it.each([
    [true, "Активна", "success"],
    [false, "Закрыта", "neutral"],
  ] as const)("показывает статус вакансии isActive=%s", (isActive, label, className) => {
    fixture.componentRef.setInput("vacancy", createVacancy(isActive));
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector(".status");
    expect(status.textContent.trim()).toBe(label);
    expect(status.classList).toContain(`status--${className}`);
  });

  it("не удаляет часть длинного названия вакансии из DOM", () => {
    const longRole = "Ведущий специалист по развитию международных образовательных программ";
    fixture.componentRef.setInput("vacancy", { ...createVacancy(true), role: longRole });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector(".vacancy__role").textContent.trim()).toBe(longRole);
  });

  it("показывает полное название навыка в readable tag", () => {
    const skillName = "Управление распределённой командой разработки";
    fixture.componentRef.setInput("vacancy", {
      ...createVacancy(true),
      requiredSkills: [{ id: 4, name: skillName, category: { name: "Soft skills" } }],
    });
    fixture.detectChanges();

    const skill = fixture.nativeElement.querySelector("app-vacancy-skills app-tag") as HTMLElement;
    expect(skill.textContent?.trim()).toBe(skillName);
  });
});
