/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SpecializationsGroupComponent } from "./specializations-group.component";
import { Component, signal } from "@angular/core";
import { By } from "@angular/platform-browser";
import { Specialization } from "@domain/specializations/specialization.model";

@Component({
  imports: [SpecializationsGroupComponent],
  template: `
    <app-specializations-group
      title="Инженерия"
      [options]="engineering"
      [isOpen]="openGroup() === 'Инженерия'"
      [selectedName]="selectedName()"
      (groupToggled)="onGroupToggled($event, 'Инженерия')"
      (selectOption)="selectedName.set($event.name)"
    ></app-specializations-group>
    <app-specializations-group
      title="IT"
      [options]="it"
      [isOpen]="openGroup() === 'IT'"
      [selectedName]="selectedName()"
      (groupToggled)="onGroupToggled($event, 'IT')"
      (selectOption)="selectedName.set($event.name)"
    ></app-specializations-group>
  `,
})
class SpecializationsGroupHostComponent {
  readonly openGroup = signal<string | null>(null);
  readonly selectedName = signal<string | null>(null);

  readonly engineering = [{ id: 1, name: "Инженер" }] as Specialization[];
  readonly it = [{ id: 2, name: "Frontend developer" }] as Specialization[];

  onGroupToggled(isOpen: boolean, groupName: string): void {
    this.openGroup.set(isOpen ? groupName : null);
  }
}

describe("SpecializationsGroupComponent", () => {
  let component: SpecializationsGroupComponent;
  let fixture: ComponentFixture<SpecializationsGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecializationsGroupComponent, SpecializationsGroupHostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SpecializationsGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("title", "Specializations");
    fixture.componentRef.setInput("options", []);
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should switch opened category with one click", () => {
    const hostFixture = TestBed.createComponent(SpecializationsGroupHostComponent);
    hostFixture.detectChanges();

    const headings = hostFixture.debugElement.queryAll(By.css(".heading__top"));
    headings[0].nativeElement.click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.openGroup()).toBe("Инженерия");
    expect(hostFixture.nativeElement.textContent).toContain("Инженер");

    headings[1].nativeElement.click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.openGroup()).toBe("IT");
    const visibleOptions = hostFixture.debugElement
      .queryAll(By.css(".content__option"))
      .map(option => option.nativeElement.textContent);

    expect(visibleOptions).toEqual(["Frontend developer"]);
  });

  it("should keep selected specialty state after click", () => {
    const hostFixture = TestBed.createComponent(SpecializationsGroupHostComponent);
    hostFixture.componentInstance.openGroup.set("IT");
    hostFixture.detectChanges();

    hostFixture.debugElement.query(By.css(".content__option")).nativeElement.click();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.selectedName()).toBe("Frontend developer");
    expect(hostFixture.debugElement.query(By.css(".content__option--selected"))).toBeTruthy();
    expect(hostFixture.debugElement.query(By.css(".content__option--selected i"))).toBeTruthy();
  });
});
