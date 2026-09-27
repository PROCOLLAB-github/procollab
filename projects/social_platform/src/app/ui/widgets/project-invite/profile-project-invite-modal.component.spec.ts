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
});
