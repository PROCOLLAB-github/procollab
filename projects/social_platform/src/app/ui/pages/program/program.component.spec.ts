/** @format */

import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { Subject } from "rxjs";
import { ProgramInfoService } from "@api/program/facades/program-info.service";
import { ProgramLaunchUseCase } from "@api/program/use-cases/program-launch.use-case";
import { ProgramComponent } from "./program.component";

describe("Program creation access in the catalog", () => {
  it("offers contact details only after a denial and replaces them with creation when allowed", () => {
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
    const creationLink = () => page.querySelector('a[href="/office/program/create"]');
    fixture.detectChanges();
    expect(creationLink()).toBeNull();
    expect(page.querySelector("details")).toBeNull();

    capability.next({ canCreateProgram: false });
    fixture.detectChanges();
    const help = page.querySelector("details");
    expect(creationLink()).toBeNull();
    expect(help?.querySelector("summary")?.textContent).toContain("Как создать программу?");
    expect(help?.querySelector('a[href="https://t.me/evsfed"]')).not.toBeNull();
    expect(help?.querySelector('a[href="mailto:partners@procollab.ru"]')).not.toBeNull();

    capability.next({ canCreateProgram: true });
    fixture.detectChanges();
    expect(creationLink()?.textContent).toContain("Создать программу");
    expect(page.querySelector("details")).toBeNull();
  });
});
