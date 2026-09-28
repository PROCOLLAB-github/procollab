/** @format */
import { provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { createProjectInviteForm } from "@api/invite/project-invite-form";
import { ProfileProjectInviteModalComponent } from "./profile-project-invite-modal.component";

describe("Окно выбора проекта", () => {
  async function setup() {
    TestBed.configureTestingModule({
      imports: [ProfileProjectInviteModalComponent],
      providers: [provideZonelessChangeDetection()],
    });
    const fixture = TestBed.createComponent(ProfileProjectInviteModalComponent);
    const form = createProjectInviteForm();
    form.controls.recipientId.setValue(13);
    fixture.componentRef.setInput("form", form);
    fixture.componentRef.setInput(
      "projects",
      Array.from({ length: 12 }, (_, id) => ({
        id: id + 1,
        name: id === 11 ? "  Аналитика   рынка " : "Проект " + id,
      })),
    );
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 20));
    await fixture.whenStable();
    return { fixture, form, dialog: document.querySelector(".project-invite")! };
  }
  it("локальный поиск нормализует пробелы и регистр, строка выбирается целиком и выделяется", async () => {
    const { fixture, dialog } = await setup();
    const chosen = vi.fn();
    fixture.componentInstance.selected.subscribe(chosen);
    const search = dialog.querySelector('input[type="search"]') as HTMLInputElement;
    search.value = " АНАЛИТИКА   рынка ";
    search.dispatchEvent(new Event("input", { bubbles: true }));
    await fixture.whenStable();
    const rows = dialog.querySelectorAll<HTMLButtonElement>('[role="radio"]');
    expect(rows.length).toBe(1);
    rows[0].click();
    expect(chosen).toHaveBeenCalledWith(12);
    fixture.componentRef.setInput("selectedProjectId", 12);
    await fixture.whenStable();
    expect(rows[0].getAttribute("aria-checked")).toBe("true");
    expect(rows[0].classList.contains("invite-row--selected")).toBe(true);
  });
  it("роль, inline error и footer находятся вне списка, CTA проверяет проект и форму", async () => {
    const { fixture, form, dialog } = await setup();
    const list = dialog.querySelector(".project-invite__list")!;
    expect(list.querySelectorAll('[role="radio"]').length).toBe(12);
    expect(list.querySelector("app-project-invite-role-input")).toBeNull();
    expect(list.querySelector("footer")).toBeNull();
    const send = dialog.querySelector(".invite-button--primary") as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    form.controls.role.setValue("Аналитик");
    fixture.componentRef.setInput("selectedProjectId", 12);
    await fixture.whenStable();
    expect(send.disabled).toBe(false);
    fixture.componentRef.setInput("error", { kind: "already_invited", message: "Уже приглашён" });
    await fixture.whenStable();
    expect(list.querySelector('[role="alert"]')).toBeNull();
    expect(dialog.querySelector('[role="alert"]')?.textContent).toContain("Уже приглашён");
    fixture.componentRef.setInput("loading", true);
    await fixture.whenStable();
    expect(send.disabled).toBe(true);
    expect(send.querySelector(".invite-spinner")).not.toBeNull();
  });
  it("без проектов сохраняет CTA перехода", async () => {
    const { fixture, dialog } = await setup();
    fixture.componentRef.setInput("projects", []);
    await fixture.whenStable();
    expect(dialog.textContent).toContain("Вы не являетесь лидером");
    expect(dialog.textContent).toContain("Перейти в проекты");
    expect(dialog.querySelector('input[type="search"]')).toBeNull();
  });
  async function setupSearch() {
    const context = await setup();
    context.fixture.componentRef.setInput("projects", [
      ...[null, undefined, "", "   "].map((name, i) => ({ id: i + 1, name })),
      { id: 15, name: "  Молодёжный   кейс-чемпионат PROCOLLAB " },
      { id: 16, name: "Аналитика рынка" },
      { id: 17, name: "Дизайн сервиса" },
    ]);
    await context.fixture.whenStable();
    return context;
  }
  it("все пустые варианты name отображаются одним fallback, реальное имя нормализуется", async () => {
    const { dialog } = await setupSearch();
    const names = [...dialog.querySelectorAll(".invite-copy strong")].map(row => row.textContent);
    expect(names.slice(0, 4)).toEqual(Array(4).fill("Проект без названия"));
    expect(names[4]).toBe("Молодёжный кейс-чемпионат PROCOLLAB");
  });
  it.each([
    "проект",
    "без",
    "названия",
    "без названия",
    "проект без",
    "роект",
    "назван",
    "БЕЗ НАЗВАНИЯ",
    "Без Названия",
    "   без     названия   ",
  ])("ищет fallback по подстроке %s", async query => {
    const { fixture, dialog } = await setupSearch();
    fixture.componentInstance.query.set(query);
    await fixture.whenStable();
    expect(fixture.componentInstance.filteredProjects().map(project => project.id)).toEqual([
      1, 2, 3, 4,
    ]);
    expect(dialog.querySelectorAll('[role="radio"]')).toHaveLength(4);
  });
  it.each(["молодёжный", "кейс", "чемпионат", "PROCOLLAB", "procollab", "кейс-чемпионат"])(
    "ищет реальное название по подстроке %s",
    async query => {
      const { fixture } = await setupSearch();
      fixture.componentInstance.query.set(query);
      await fixture.whenStable();
      expect(fixture.componentInstance.filteredProjects().map(project => project.id)).toEqual([15]);
    },
  );
  it("очистка восстанавливает все проекты и выбранный ID после скрытия поиском", async () => {
    const { fixture, dialog } = await setupSearch();
    fixture.componentRef.setInput("selectedProjectId", 15);
    const selected = vi.fn();
    fixture.componentInstance.selected.subscribe(selected);
    fixture.componentInstance.query.set("без названия");
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedProjectId()).toBe(15);
    expect(dialog.querySelector('[aria-checked="true"]')).toBeNull();
    fixture.componentInstance.query.set("несуществующий проект");
    await fixture.whenStable();
    expect(dialog.textContent).toContain("Проекты не найдены");
    for (const query of ["", "   "]) {
      fixture.componentInstance.query.set(query);
      await fixture.whenStable();
      expect(dialog.querySelectorAll('[role="radio"]')).toHaveLength(7);
      expect(dialog.querySelector('[aria-checked="true"]')?.textContent).toContain("Молодёжный");
      expect(fixture.componentInstance.selectedProjectId()).toBe(15);
    }
    expect(selected).not.toHaveBeenCalled();
  });
});
