/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SkillsGroupComponent } from "./skills-group.component";

describe("SkillsGroupComponent", () => {
  let component: SkillsGroupComponent;
  let fixture: ComponentFixture<SkillsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsGroupComponent],
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
    component.contentVisible.set(true);
    fixture.detectChanges();

    const heading = fixture.nativeElement.querySelector(".heading__top") as HTMLElement;
    const panel = fixture.nativeElement.querySelector(
      '[data-testid="skills-options-panel"]',
    ) as HTMLElement;

    expect(heading.classList).toContain("heading__top--selected");
    expect(panel.classList).toContain("content--open");
    expect(panel.textContent).toContain("Типографика");
  });
});
