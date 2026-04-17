/** @format */

import { TestBed, ComponentFixture } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { provideRouter } from "@angular/router";
import { CourseModuleCardComponent } from "./course-module-card.component";
import { CourseModule } from "@domain/courses/courses.model";

function buildModule(overrides: Partial<CourseModule> = {}): CourseModule {
  return {
    id: 1,
    courseId: 100,
    title: "Основы",
    order: 1,
    avatarUrl: "",
    startDate: new Date(),
    status: "",
    isAvailable: true,
    progressStatus: "in_progress",
    percent: 50,
    lessons: [],
    ...overrides,
  };
}

describe("CourseModuleCardComponent", () => {
  let fixture: ComponentFixture<CourseModuleCardComponent>;
  let component: CourseModuleCardComponent;

  async function setup(courseModule: CourseModule): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [CourseModuleCardComponent],
      providers: [provideRouter([])], // нужен для [routerLink] внутри шаблона
    }).compileComponents();

    fixture = TestBed.createComponent(CourseModuleCardComponent);
    component = fixture.componentInstance;
    component.courseModule = courseModule;
    fixture.detectChanges();
  }

  describe("рендер данных из @Input", () => {
    it("отображает номер модуля и заголовок", async () => {
      await setup(buildModule({ order: 3, title: "Продвинутая алгебра" }));

      const title = fixture.debugElement.query(By.css(".skill-card__title"));
      const text = fixture.debugElement.query(By.css(".skill-card__text"));

      expect(title.nativeElement.textContent).toContain("Модуль 3");
      expect(text.nativeElement.textContent).toContain("Продвинутая алгебра");
    });

    it("выводит количество уроков с корректной плюрализацией", async () => {
      await setup(
        buildModule({
          lessons: [
            { id: 1, order: 1, title: "a", taskCount: 0, percent: 0, isAvailable: true } as never,
            { id: 2, order: 2, title: "b", taskCount: 0, percent: 0, isAvailable: true } as never,
          ],
        })
      );

      const level = fixture.debugElement.query(By.css(".skill-card__level"));
      // Плюрализация: 2 → "урока" (от 2 до 4).
      expect(level.nativeElement.textContent).toContain("2 урока");
    });
  });

  describe("expand-toggle виден только для модулей с уроками", () => {
    it("не рендерит стрелку expand, если уроков нет", async () => {
      await setup(buildModule({ lessons: [] }));

      const toggle = fixture.debugElement.query(By.css(".skill-card__expand"));
      expect(toggle).toBeNull();
    });

    it("рендерит стрелку expand, если есть хотя бы один урок", async () => {
      await setup(
        buildModule({
          lessons: [
            { id: 1, order: 1, title: "a", taskCount: 0, percent: 0, isAvailable: true } as never,
          ],
        })
      );

      const toggle = fixture.debugElement.query(By.css(".skill-card__expand"));
      expect(toggle).not.toBeNull();
    });
  });

  describe("клик переключает isExpanded", () => {
    it("клик по карточке с уроками — isExpanded из false становится true, второй клик — обратно", async () => {
      await setup(
        buildModule({
          lessons: [
            { id: 1, order: 1, title: "a", taskCount: 0, percent: 0, isAvailable: true } as never,
          ],
        })
      );
      expect(component.isExpanded).toBe(false);

      const wrapper = fixture.debugElement.query(By.css(".skill-card--wrapper"));
      wrapper.triggerEventHandler("click", new MouseEvent("click"));
      fixture.detectChanges();
      expect(component.isExpanded).toBe(true);

      wrapper.triggerEventHandler("click", new MouseEvent("click"));
      fixture.detectChanges();
      expect(component.isExpanded).toBe(false);
    });

    it("клик по карточке без уроков — isExpanded остаётся false", async () => {
      await setup(buildModule({ lessons: [] }));

      const wrapper = fixture.debugElement.query(By.css(".skill-card--wrapper"));
      wrapper.triggerEventHandler("click", new MouseEvent("click"));
      fixture.detectChanges();

      expect(component.isExpanded).toBe(false);
    });
  });

  describe("список уроков в expandable", () => {
    it("рендерит li под каждый урок", async () => {
      await setup(
        buildModule({
          lessons: [
            { id: 1, order: 1, title: "a", taskCount: 1, percent: 0, isAvailable: true } as never,
            { id: 2, order: 2, title: "b", taskCount: 2, percent: 0, isAvailable: true } as never,
            { id: 3, order: 3, title: "c", taskCount: 3, percent: 0, isAvailable: true } as never,
          ],
        })
      );

      const items = fixture.debugElement.queryAll(By.css(".expandable__item"));
      expect(items.length).toBe(3);
    });
  });
});
