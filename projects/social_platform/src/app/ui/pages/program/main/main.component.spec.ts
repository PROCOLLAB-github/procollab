/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ProgramMainComponent } from "./main.component";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { ProgramMainInfoService } from "@api/program/facades/program-main-info.service";
import { ProgramMainUIInfoService } from "@api/program/facades/ui/program-main-ui-info.service";

describe("MainComponent", () => {
  let component: ProgramMainComponent;
  let fixture: ComponentFixture<ProgramMainComponent>;
  const participating = signal(false);
  const toggleParticipation = vi.fn(() => participating.update(checked => !checked));

  beforeEach(async () => {
    participating.set(false);
    toggleParticipation.mockClear();
    const programMainInfoServiceSpy = {
      initializationMainPrograms: vi.fn(),
      destroy: vi.fn(),
      onTogglePparticipating: toggleParticipation,
    };

    const programMainUIInfoServiceSpy = {
      programs: signal([]),
      isPparticipating: participating,
      programOptionsFilter: [],
    };

    await TestBed.configureTestingModule({
      imports: [ProgramMainComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(ProgramMainComponent, {
        remove: { providers: [ProgramMainInfoService, ProgramMainUIInfoService] },
        add: {
          providers: [
            { provide: ProgramMainInfoService, useValue: programMainInfoServiceSpy },
            { provide: ProgramMainUIInfoService, useValue: programMainUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("opens the filters and toggles participation once from the checkbox or its label", () => {
    const root: HTMLElement = fixture.nativeElement;
    const trigger = root.querySelector<HTMLButtonElement>("[aria-controls]")!;
    const panel = root.querySelector<HTMLElement>("#program-catalog-filters")!;
    const checkbox = panel.querySelector<HTMLButtonElement>('[role="checkbox"]')!;
    const label = panel.querySelector<HTMLElement>("#program-participation-filter")!;
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(checkbox.getAttribute("aria-labelledby")).toBe(label.id);
    expect(label.textContent?.trim()).toBe("участвую");

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute("aria-expanded")).toBe("true");

    checkbox.click();
    fixture.detectChanges();
    expect(toggleParticipation).toHaveBeenCalledTimes(1);
    expect(checkbox.getAttribute("aria-checked")).toBe("true");
    expect(trigger.textContent?.trim()).toBe("Фильтры (1)");

    trigger.click();
    fixture.detectChanges();
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent?.trim()).toBe("Фильтры (1)");

    trigger.click();
    fixture.detectChanges();
    label.click();
    fixture.detectChanges();
    expect(toggleParticipation).toHaveBeenCalledTimes(2);
    expect(checkbox.getAttribute("aria-checked")).toBe("false");
    expect(trigger.textContent?.trim()).toBe("Фильтры");
  });
});
