/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Component, signal } from "@angular/core";
import { Skill } from "@domain/skills/skill.model";
import { By } from "@angular/platform-browser";

import { SkillsGroupComponent } from "./skills-group.component";

@Component({
  imports: [SkillsGroupComponent],
  template: `
    @for (group of groups; track group.id) {
      <app-skills-group
        [title]="group.name"
        [options]="group.skills"
        [selected]="selected()"
        [hasOpenGroups]="openGroup() !== null"
        [isOpen]="openGroup() === group.id"
        (groupToggled)="openGroup.set($event ? group.id : null)"
        (optionToggled)="toggleSkill($event)"
      ></app-skills-group>
    }
  `,
})
class SkillsGroupHostComponent {
  readonly openGroup = signal<number | null>(null);
  readonly selected = signal<Skill[]>([]);
  readonly groups = [
    {
      id: 1,
      name: "Дизайн",
      skills: [{ id: 1, name: "Figma", category: { id: 1, name: "Дизайн" } }],
    },
    {
      id: 2,
      name: "Разработка",
      skills: [{ id: 2, name: "Angular", category: { id: 2, name: "Разработка" } }],
    },
  ] as Array<{ id: number; name: string; skills: Skill[] }>;

  toggleSkill(skill: Skill): void {
    this.selected.update(selected =>
      selected.some(item => item.id === skill.id)
        ? selected.filter(item => item.id !== skill.id)
        : [...selected, skill],
    );
  }
}

describe("SkillsGroupComponent", () => {
  let component: SkillsGroupComponent;
  let fixture: ComponentFixture<SkillsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsGroupComponent, SkillsGroupHostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillsGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("options", []);
    fixture.componentRef.setInput("selected", []);
    fixture.componentRef.setInput("title", "Skills");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("показывает options panel сверху правой области для активной категории", () => {
    fixture.componentRef.setInput("hasOpenGroups", true);
    fixture.componentRef.setInput("options", [
      { id: 1, name: "Типографика", category: { id: 2, name: "Дизайн" } },
    ]);
    fixture.componentRef.setInput("isOpen", true);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector(".heading__top") as HTMLElement;
    const panel = fixture.nativeElement.querySelector(
      '[data-testid="skills-options-panel"]',
    ) as HTMLElement;

    expect(heading.classList).toContain("heading__top--selected");
    expect(panel.classList).toContain("content--open");
    expect(panel.textContent).toContain("Типографика");
  });

  it("switches categories in one click and keeps selected skills", () => {
    const hostFixture = TestBed.createComponent(SkillsGroupHostComponent);
    hostFixture.detectChanges();

    const headings = hostFixture.debugElement.queryAll(By.css(".heading__top"));
    headings[0].nativeElement.click();
    hostFixture.detectChanges();
    hostFixture.debugElement.query(By.css(".content__option")).nativeElement.click();
    hostFixture.detectChanges();

    headings[1].nativeElement.click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.openGroup()).toBe(2);
    expect(hostFixture.componentInstance.selected().map(skill => skill.name)).toEqual(["Figma"]);
    expect(hostFixture.nativeElement.textContent).toContain("Angular");
    expect(hostFixture.nativeElement.textContent).not.toContain("Figma");
  });
});
