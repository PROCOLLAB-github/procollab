/** @format */
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { HttpErrorResponse } from "@angular/common/http";
import { of, Subject, throwError } from "rxjs";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramCreateComponent } from "./create.component";

describe("Создание программы", () => {
  let api: { capabilities: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    sessionStorage.removeItem("programCreationIntent:v1");
    api = { capabilities: vi.fn(() => of({ canCreateProgram: true })), create: vi.fn() };
    TestBed.configureTestingModule({
      imports: [ProgramCreateComponent],
      providers: [provideRouter([]), { provide: ProgramLaunchUseCase, useValue: api }],
    });
  });
  afterEach(() => {
    sessionStorage.removeItem("programCreationIntent:v1");
    vi.restoreAllMocks();
  });
  function create() {
    const fixture = TestBed.createComponent(ProgramCreateComponent);
    fixture.detectChanges();
    return fixture;
  }
  it("requires a real title and focuses the invalid field without creating an object", () => {
    const fixture = create();
    fixture.componentInstance.form.controls.name.setValue("  ");
    fixture.componentInstance.submit();
    fixture.detectChanges();
    expect(api.create).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(
      fixture.nativeElement.querySelector("input[formControlName=name]"),
    );
  });
  it("prevents duplicate submit while pending and navigates to the created draft", () => {
    const response = new Subject<{ id: number }>();
    api.create.mockReturnValue(response);
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
    const fixture = create();
    const component = fixture.componentInstance;
    component.form.patchValue({ name: "Новая программа", format: "hackathon" });
    component.submit();
    component.submit();
    expect(api.create).toHaveBeenCalledTimes(1);
    expect(component.canDeactivate()).toBe(false);
    expect(api.create.mock.calls[0][0]).toMatchObject({
      name: "Новая программа",
      format: "hackathon",
    });
    response.next({ id: 42 });
    response.complete();
    expect(navigate).toHaveBeenCalledWith("/office/program/42/launch");
    expect(component.canDeactivate()).toBe(true);
    expect(sessionStorage.getItem("programCreationIntent:v1")).toBe(null);
  });
  it("a lost response preserves the input and reuses the same key for retry", () => {
    api.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    const fixture = create();
    const component = fixture.componentInstance;
    component.form.patchValue({ name: "Повтор", format: "noncompetitive" });
    component.submit();
    component.submit();
    expect(api.create).toHaveBeenCalledTimes(2);
    expect(api.create.mock.calls[0][0]).toEqual(api.create.mock.calls[1][0]);
    expect(component.form.controls.name.value).toBe("Повтор");
    expect(component.error()).not.toBe(null);
  });
  it("permission denial is handled without sending a creation command", () => {
    api.capabilities.mockReturnValue(of({ canCreateProgram: false }));
    const fixture = create();
    fixture.componentInstance.submit();
    expect(fixture.nativeElement.textContent).toContain(
      "Право создания отдельно выдает администратор",
    );
    expect(api.create).not.toHaveBeenCalled();
  });
  it("cancel clears a pending intent without creating an empty draft", () => {
    const router = TestBed.inject(Router);
    const navigate = vi.spyOn(router, "navigateByUrl").mockResolvedValue(true);
    const fixture = create();
    fixture.componentInstance.form.controls.name.setValue("Не сохранять");
    fixture.componentInstance.cancel();
    expect(api.create).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/office/program/managed");
  });
});
