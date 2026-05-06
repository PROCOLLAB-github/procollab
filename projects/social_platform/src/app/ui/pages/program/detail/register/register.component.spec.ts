/** @format */

import { TestBed, ComponentFixture } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { By } from "@angular/platform-browser";
import { of } from "rxjs";
import { NgxMaskModule } from "ngx-mask";
import { ValidationService } from "@corelib";
import { ProgramRegisterComponent } from "./register.component";
import { RegisterProgramUseCase } from "@api/program/use-cases/register-program.use-case";
import { AppRoutes } from "@api/paths/app-routes";
import { ok, fail } from "@domain/shared/result.type";

const SCHEMA = {
  city: { name: "Город", placeholder: "Москва" },
  age: { name: "Возраст", placeholder: "18" },
} as const;

function makeFakeRoute(programId: string, schema: unknown = SCHEMA): ActivatedRoute {
  return {
    data: of({ data: schema }),
    snapshot: { params: { programId } },
  } as unknown as ActivatedRoute;
}

describe("ProgramRegisterComponent", () => {
  let fixture: ComponentFixture<ProgramRegisterComponent>;
  let component: ProgramRegisterComponent;
  let routerSpy: jasmine.SpyObj<Router>;
  let useCaseSpy: jasmine.SpyObj<RegisterProgramUseCase>;
  let validationSpy: jasmine.SpyObj<ValidationService>;

  async function setup(
    options: {
      programId?: string;
      schema?: unknown;
      formValid?: boolean;
    } = {}
  ): Promise<void> {
    const { programId = "42", schema = SCHEMA, formValid = true } = options;

    routerSpy = jasmine.createSpyObj<Router>("Router", ["navigateByUrl"]);
    routerSpy.navigateByUrl.and.resolveTo(true);

    useCaseSpy = jasmine.createSpyObj<RegisterProgramUseCase>("RegisterProgramUseCase", [
      "execute",
    ]);
    // По умолчанию use-case отвечает успехом. Тест, которому нужно поражение, переопределит.
    useCaseSpy.execute.and.returnValue(of(ok({} as never)));

    validationSpy = jasmine.createSpyObj<ValidationService>("ValidationService", [
      "getFormValidation",
    ]);
    validationSpy.getFormValidation.and.returnValue(formValid);

    await TestBed.configureTestingModule({
      imports: [ProgramRegisterComponent, NgxMaskModule.forRoot()],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: makeFakeRoute(programId, schema) },
        { provide: RegisterProgramUseCase, useValue: useCaseSpy },
        { provide: ValidationService, useValue: validationSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  describe("ngOnInit строит форму из schema резолвера", () => {
    it("создаёт FormGroup с полем под каждый ключ schema", async () => {
      await setup();

      expect(component.registerForm).toBeDefined();
      expect(component.registerForm!.contains("city")).toBe(true);
      expect(component.registerForm!.contains("age")).toBe(true);
    });

    it("рендерит столько app-input, сколько полей в schema", async () => {
      await setup();

      const inputs = fixture.debugElement.queryAll(By.css("app-input"));
      expect(inputs.length).toBe(Object.keys(SCHEMA).length);
    });
  });

  describe("onSubmit", () => {
    it("не вызывает use-case, если форма невалидна", async () => {
      await setup({ formValid: false });

      component.onSubmit();

      expect(useCaseSpy.execute).not.toHaveBeenCalled();
    });

    it("вызывает use-case с programId и значениями формы", async () => {
      await setup({ programId: "99" });

      component.registerForm!.patchValue({ city: "Москва", age: "25" });
      component.onSubmit();

      expect(useCaseSpy.execute).toHaveBeenCalledOnceWith(99, { city: "Москва", age: "25" });
    });

    it("навигирует на детальную страницу программы при успехе use-case", async () => {
      await setup({ programId: "99" });

      component.onSubmit();

      expect(routerSpy.navigateByUrl).toHaveBeenCalledOnceWith(AppRoutes.program.detail("99"));
    });

    it("не навигирует, если use-case вернул failure", async () => {
      await setup();
      useCaseSpy.execute.and.returnValue(of(fail({ kind: "register_program_error" as const })));

      component.onSubmit();

      expect(routerSpy.navigateByUrl).not.toHaveBeenCalled();
    });

    it("срабатывает по клику на кнопку submit в DOM", async () => {
      await setup({ programId: "99" });

      const button = fixture.debugElement.query(By.css("app-button"));
      button.triggerEventHandler("click", null);

      expect(useCaseSpy.execute).toHaveBeenCalledTimes(1);
      expect(routerSpy.navigateByUrl).toHaveBeenCalledWith(AppRoutes.program.detail("99"));
    });
  });
});
