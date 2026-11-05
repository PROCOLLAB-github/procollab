/** @format */

import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { OverlayContainer } from "@angular/cdk/overlay";
import { Subject } from "rxjs";
import { ProgramInfoService } from "@api/program/facades/program-info.service";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramComponent } from "./program.component";

describe("Program creation access in the catalog", () => {
  it("keeps contact details open while hovering them and offers creation only when allowed", async () => {
    const capability = new Subject<{ canCreateProgram: boolean }>();
    TestBed.configureTestingModule({
      imports: [ProgramComponent],
      providers: [
        provideRouter([]),
        {
          provide: ProgramLaunchUseCase,
          useValue: { capabilities: () => capability.asObservable() },
        },
      ],
    });
    TestBed.overrideComponent(ProgramComponent, {
      remove: { providers: [ProgramInfoService] },
      add: {
        providers: [{ provide: ProgramInfoService, useValue: { initializationPrograms: vi.fn() } }],
      },
    });
    const fixture = TestBed.createComponent(ProgramComponent);
    const page: HTMLElement = fixture.nativeElement;
    const creationButton = () =>
      page.querySelector<HTMLButtonElement>(".catalog-toolbar app-button button");
    const helpTrigger = () =>
      page.querySelector<HTMLButtonElement>('button[aria-label="Как создать программу?"]');
    fixture.detectChanges();
    expect(creationButton()).toBeNull();
    expect(helpTrigger()).toBeNull();

    capability.next({ canCreateProgram: false });
    fixture.detectChanges();
    const help = helpTrigger()!;
    expect(creationButton()).toBeNull();
    help.dispatchEvent(new MouseEvent("pointerenter"));
    fixture.detectChanges();
    expect(help.getAttribute("aria-expanded")).toBe("true");

    const overlay = TestBed.inject(OverlayContainer).getContainerElement();
    const panel = overlay.querySelector('[role="dialog"]')!;
    expect(panel.querySelector('a[href="https://t.me/evsfed"]')).not.toBeNull();
    expect(panel.querySelector('a[href="mailto:partners@procollab.ru"]')).not.toBeNull();

    help.dispatchEvent(new MouseEvent("pointerleave"));
    panel.dispatchEvent(new MouseEvent("pointerenter"));
    await new Promise(resolve => setTimeout(resolve, 240));
    fixture.detectChanges();
    expect(overlay.contains(panel)).toBe(true);

    help.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    fixture.detectChanges();
    expect(overlay.contains(panel)).toBe(false);

    capability.next({ canCreateProgram: true });
    fixture.detectChanges();
    expect(creationButton()?.textContent).toContain("создать программу");
    expect(helpTrigger()).toBeNull();
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    creationButton()!.click();
    expect(navigate).toHaveBeenCalledExactlyOnceWith("/office/program/create");
  });
});
