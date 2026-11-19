/** @format */

import { Component, provideZonelessChangeDetection } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SectionHeaderComponent } from "./section-header.component";

@Component({
  imports: [SectionHeaderComponent],
  template: `
    <app-section-header [title]="title" [description]="description">
      <button type="button" (click)="actionCount = actionCount + 1">Предпросмотр формы</button>
    </app-section-header>
  `,
})
class SectionHeaderHostComponent {
  title = "Критерии оценки";
  description = "Один набор для всех кейсов программы.";
  actionCount = 0;
}

describe("SectionHeaderComponent", () => {
  it("сохраняет доступный заголовок и действие при обновлении содержимого", async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeaderHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();
    const fixture = TestBed.createComponent(SectionHeaderHostComponent);
    await fixture.whenStable();
    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector("h2")?.textContent).toContain("Критерии оценки");
    expect(element.querySelector("p")?.textContent).toContain("Один набор");

    element.querySelector("button")?.click();
    expect(fixture.componentInstance.actionCount).toBe(1);
    fixture.componentInstance.title = "Эксперты";
    fixture.componentInstance.description = "";
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();

    expect(element.querySelector("h2")?.textContent).toContain("Эксперты");
    expect(element.querySelector("p")).toBeNull();
    expect(element.querySelector("button")?.textContent).toContain("Предпросмотр формы");
  });
});
