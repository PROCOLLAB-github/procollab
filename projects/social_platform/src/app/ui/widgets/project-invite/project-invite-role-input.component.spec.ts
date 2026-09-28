/** @format */
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createProjectInviteForm } from "@api/invite/project-invite-form";
import { filterProjectRoles, normalizeInviteText } from "@domain/invite/project-role-suggestions";
import { ProjectInviteRoleInputComponent } from "./project-invite-role-input.component";
describe("Свободная роль с autocomplete", () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });
  afterEach(() => {
    delete (Element.prototype as any).scrollIntoView;
  });
  it("фильтрует без учёта регистра, включая русскую подсказку для Data Analyst", () => {
    expect(filterProjectRoles(" АНАЛ ")).toEqual(["Бизнес-аналитик", "Аналитик", "Data Analyst"]);
    expect(filterProjectRoles("Backend")).toEqual(["Backend-разработчик"]);
  });
  it("required, max128, свободный текст, нормализация без смены регистра", () => {
    const role = createProjectInviteForm().controls.role;
    role.setValue("   ");
    expect(role.hasError("required")).toBe(true);
    role.setValue("я".repeat(128));
    expect(role.valid).toBe(true);
    role.setValue("я".repeat(129));
    expect(role.hasError("maxlength")).toBe(true);
    role.setValue("Эксперт по работе с промышленными партнёрами");
    expect(role.valid).toBe(true);
    expect(normalizeInviteText("  Эксперт   по  Партнёрам  ")).toBe("Эксперт по Партнёрам");
  });
  it("ArrowDown/Up/Enter выбирают редактируемую подсказку, Escape закрывает только dropdown", async () => {
    TestBed.configureTestingModule({
      imports: [ProjectInviteRoleInputComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ProjectInviteRoleInputComponent);
    const role = createProjectInviteForm().controls.role;
    fixture.componentRef.setInput("control", role);
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector("input") as HTMLInputElement;
    input.focus();
    role.setValue("анал");
    await fixture.whenStable();
    const key = (key: string) =>
      input.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }));
    key("ArrowDown");
    key("ArrowDown");
    key("ArrowUp");
    key("Enter");
    expect(role.value).toBe("Бизнес-аналитик");
    role.setValue(role.value + " проекта");
    expect(role.valid).toBe(true);
    role.setValue("анал");
    fixture.componentInstance.opened.set(true);
    const event = new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true });
    input.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.opened()).toBe(false);
  });
  it("подсказку можно выбрать мышью и затем изменить", async () => {
    TestBed.configureTestingModule({
      imports: [ProjectInviteRoleInputComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ProjectInviteRoleInputComponent);
    const role = createProjectInviteForm().controls.role;
    fixture.componentRef.setInput("control", role);
    await fixture.whenStable();
    fixture.componentInstance.opened.set(true);
    role.setValue("QA");
    await fixture.whenStable();
    fixture.nativeElement.querySelector('[role="option"]').click();
    expect(role.value).toBe("QA / тестировщик");
    role.setValue("QA / тестировщик интеграций");
    expect(role.valid).toBe(true);
  });
});
