/** @format */

import { TestBed, ComponentFixture } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { By } from "@angular/platform-browser";
import { TaskCompleteComponent } from "./complete.component";
import { AppRoutes } from "@api/paths/app-routes";

function makeFakeRouteWithCourseId(courseId: string | null): ActivatedRoute {
  const snapshot = {
    paramMap: {
      get: (key: string) => (key === "courseId" ? courseId : null),
    },
  };
  const level3 = { snapshot };
  const level2 = { parent: level3 };
  const level1 = { parent: level2 };
  return { parent: level1 } as unknown as ActivatedRoute;
}

describe("TaskCompleteComponent", () => {
  let fixture: ComponentFixture<TaskCompleteComponent>;
  let component: TaskCompleteComponent;
  let routerSpy: jasmine.SpyObj<Router>;

  async function setup(courseId: string | null): Promise<void> {
    routerSpy = jasmine.createSpyObj<Router>("Router", ["navigateByUrl"]);

    await TestBed.configureTestingModule({
      imports: [TaskCompleteComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: makeFakeRouteWithCourseId(courseId) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCompleteComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  }

  describe("ngOnInit", () => {
    it("выставляет courseId в сигнал, если параметр есть в родительском route", async () => {
      await setup("42");

      expect(component.courseId()).toBe(42);
    });

    it("выставляет null, если courseId невалидный (не число)", async () => {
      await setup("abc");

      expect(component.courseId()).toBeNull();
    });

    it("выставляет 0 (не null!), если courseId отсутствует в snapshot", async () => {
      await setup(null);

      expect(component.courseId()).toBe(0);
    });
  });

  describe("routeToCourses (клик по кнопке)", () => {
    it("навигирует на детальную страницу курса, когда courseId известен", async () => {
      await setup("7");

      const button = fixture.debugElement.query(By.css("app-button"));
      expect(button).withContext("кнопка должна быть в DOM").toBeTruthy();

      button.triggerEventHandler("click", null);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(AppRoutes.courses.detail(7));
    });

    it("навигирует на список курсов, когда courseId недоступен", async () => {
      await setup(null);

      const button = fixture.debugElement.query(By.css("app-button"));
      button.triggerEventHandler("click", null);

      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(AppRoutes.courses.list());
    });
  });
});
