/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { VacancyFilterComponent } from "./vacancy-filter.component";
import { provideRouter, Router } from "@angular/router";
import { provideNoopAnimations } from "@angular/platform-browser/animations";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { VacancyRepositoryPort } from "@domain/vacancy/ports/vacancy.repository.port";
import { of } from "rxjs";

describe("VacancyFilterComponent", () => {
  let component: VacancyFilterComponent;
  let fixture: ComponentFixture<VacancyFilterComponent>;

  beforeEach(async () => {
    const vacancyRepoSpy = {
      getForProject: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [VacancyFilterComponent, HttpClientTestingModule],
      providers: [
        { provide: VacancyRepositoryPort, useValue: vacancyRepoSpy },
        provideRouter([]),
        provideNoopAnimations(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VacancyFilterComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("скрывает сброс без примененных фильтров и при пустом поиске в обеих версиях", async () => {
    await TestBed.inject(Router).navigate([], {
      queryParams: { role_contains: "   ", unrelated: "value" },
    });
    component["filterOpen"].set(true);
    fixture.detectChanges();
    expect(resetButtons()).toHaveLength(0);
  });

  for (const target of ["desktop", "mobile"]) {
    it(`сбрасывает поиск, зарплату и остальные фильтры из ${target}`, async () => {
      const router = TestBed.inject(Router);
      await router.navigate([], {
        queryParams: {
          role_contains: "аналитик",
          required_experience: "no_experience",
          work_format: "remote",
          work_schedule: "full_time",
          salary: "with-salary",
        },
      });
      component["filterOpen"].set(true);
      fixture.detectChanges();
      expect(resetButtons()).toHaveLength(2);

      const reset = Array.from(
        fixture.nativeElement.querySelectorAll(
          `.${target} button`,
        ) as NodeListOf<HTMLButtonElement>,
      ).find(button => button.textContent?.trim() === "сбросить");
      expect(reset).toBeDefined();
      reset!.click();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(router.url).toBe("/");
      expect(resetButtons()).toHaveLength(0);
    });
  }

  it("показывает сброс для единственного активного фильтра зарплаты", async () => {
    await TestBed.inject(Router).navigate([], { queryParams: { salary: "with-salary" } });
    fixture.detectChanges();
    expect(resetButtons()).toHaveLength(1);
  });

  it("недоступный фильтр зарплаты не переключается и не создает ложный выбор без query", () => {
    fixture.detectChanges();
    const salary = fixture.nativeElement.querySelector(
      'button[role="checkbox"][aria-label="С зарплатой"]',
    ) as HTMLButtonElement;
    expect(salary.disabled).toBe(true);
    expect(salary.getAttribute("aria-checked")).toBe("false");
    salary.click();
    salary.dispatchEvent(new KeyboardEvent("keydown", { key: " ", bubbles: true }));
    salary.dispatchEvent(new KeyboardEvent("keyup", { key: " ", bubbles: true }));
    fixture.detectChanges();
    expect(salary.getAttribute("aria-checked")).toBe("false");
    expect(TestBed.inject(Router).url).toBe("/");
    expect(resetButtons()).toHaveLength(0);
  });

  function resetButtons(): HTMLButtonElement[] {
    return Array.from(
      fixture.nativeElement.querySelectorAll("button") as NodeListOf<HTMLButtonElement>,
    ).filter(button => button.textContent?.trim() === "сбросить");
  }
});
