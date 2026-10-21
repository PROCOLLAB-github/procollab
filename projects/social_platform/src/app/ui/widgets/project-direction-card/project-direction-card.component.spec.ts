/** @format */

import { OverlayContainer } from "@angular/cdk/overlay";
import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { UpdateGoalUseCase } from "@api/project/use-cases/update-goal.use-case";
import { Skill } from "@domain/skills/skill.model";
import { of } from "rxjs";
import { ProjectDirectionCard } from "./project-direction-card.component";

const skills: Skill[] = [
  { id: 1, name: "Лидерство", category: { id: 1, name: "Soft skills" }, approves: [] },
  {
    id: 2,
    name: "Программирование микроконтроллеров и встраиваемых систем",
    category: { id: 2, name: "Разработка" },
    approves: [],
  },
];

describe("Навыки в карточке направления профиля", () => {
  let fixture: ComponentFixture<ProjectDirectionCard>;
  let overlay: HTMLElement;
  const updateGoal = { execute: vi.fn() };

  async function setup(kind: "skills" | "achievements" | "goals" = "skills") {
    TestBed.configureTestingModule({
      imports: [ProjectDirectionCard],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UpdateGoalUseCase, useValue: updateGoal },
        { provide: Router, useValue: { navigate: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ listType: kind === "goals" ? "project" : "profile" }),
            queryParams: of({}),
            snapshot: { params: { projectId: "1" }, queryParams: {} },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(ProjectDirectionCard);
    fixture.componentRef.setInput("direction", kind === "skills" ? "навыки" : "достижения");
    fixture.componentRef.setInput("icon", "folder");
    fixture.componentRef.setInput("type", "list");
    fixture.componentRef.setInput("about", kind === "skills" ? skills : []);
    if (kind === "goals") fixture.componentRef.setInput("projectInfoType", "goals");
    else fixture.componentRef.setInput("profileInfoType", kind);
    await fixture.whenStable();
    overlay = TestBed.inject(OverlayContainer).getContainerElement();
  }

  async function open() {
    fixture.nativeElement.querySelector(".direction-card").click();
    await fixture.whenStable();
    await new Promise(resolve => setTimeout(resolve, 0));
    await fixture.whenStable();
    return overlay.querySelector<HTMLElement>('[role="dialog"]')!;
  }

  afterEach(() => {
    fixture?.destroy();
    vi.clearAllMocks();
  });

  it("показывает реальные названия, порядок, категории и счетчик без действий подтверждения", async () => {
    await setup();
    const trigger = fixture.nativeElement.querySelector("button.direction-card");
    expect(trigger.getAttribute("aria-haspopup")).toBe("dialog");
    const dialog = await open();
    expect(dialog.getAttribute("aria-labelledby")).toBe("profile-skills-title");
    expect(trigger.getAttribute("aria-expanded")).toBe("true");
    expect(
      [...dialog.querySelectorAll(".profile-skills__name")].map(n => n.textContent?.trim()),
    ).toEqual(skills.map(skill => skill.name));
    expect(dialog.querySelector(".profile-skills__count")?.textContent?.trim()).toBe("2");
    expect([...dialog.querySelectorAll("app-tag")].map(n => n.textContent?.trim())).toEqual([
      "soft",
      "Soft skills",
      "hard",
      "Разработка",
    ]);
    expect(dialog.querySelectorAll("button").length).toBe(1);
    expect(updateGoal.execute).not.toHaveBeenCalled();
  });

  it("закрывается крестиком, Escape и backdrop, передавая false вместо переключения состояния", async () => {
    await setup();
    for (const action of ["close", "escape", "backdrop"]) {
      const dialog = await open();
      if (action === "close") dialog.querySelector<HTMLButtonElement>("button")!.click();
      else if (action === "escape") {
        dialog.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
      } else overlay.querySelector<HTMLElement>(".modal__overlay")!.click();
      await fixture.whenStable();
      await new Promise(resolve => setTimeout(resolve, 0));
      await fixture.whenStable();
      expect(overlay.querySelector('[role="dialog"]')).toBeNull();
      expect(fixture.componentInstance.isShowModal).toBe(false);
      expect(fixture.nativeElement.querySelector("button").getAttribute("aria-expanded")).toBe(
        "false",
      );
    }
  });

  it("обновляет уже открытый список при смене данных профиля, сохраняя новый порядок", async () => {
    await setup();
    const dialog = await open();
    fixture.componentRef.setInput("about", [skills[1]]);
    await fixture.whenStable();
    expect(dialog.querySelectorAll(".profile-skills__item").length).toBe(1);
    expect(dialog.querySelector(".profile-skills__name")?.textContent?.trim()).toBe(skills[1].name);
    expect(dialog.querySelector(".profile-skills__count")?.textContent?.trim()).toBe("1");
  });

  it.each(["achievements", "goals"] as const)("сохраняет прежнюю оболочку для %s", async kind => {
    await setup(kind);
    await open();
    expect(fixture.nativeElement.querySelector("app-profile-skills-dialog")).toBeNull();
    expect(overlay.querySelector(".cancel")).not.toBeNull();
    expect(overlay.querySelector(".profile-skills-modal")).toBeNull();
    expect(overlay.querySelector('[role="dialog"]')).toBeNull();
  });
});
