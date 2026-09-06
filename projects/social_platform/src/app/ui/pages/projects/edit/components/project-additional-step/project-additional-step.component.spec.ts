/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import { Component, inject, provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { By } from "@angular/platform-browser";
import { provideNgxMask } from "ngx-mask";
import { firstValueFrom, of, Subject } from "rxjs";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { TooltipInfoService } from "@api/tooltip/tooltip-info.service";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { ProgramLinkFields } from "@domain/project/program-link-fields.model";
import { SelectComponent } from "@ui/primitives/select/select.component";
import { ProjectAdditionalStepComponent } from "./project-additional-step.component";

@Component({
  imports: [ProjectAdditionalStepComponent],
  template: '<button (click)="submit()">Сдать</button><app-project-additional-step />',
})
class SubmitHost {
  private readonly fields = inject(ProjectAdditionalService);
  submit(): void {
    this.fields.save(700, true).subscribe();
  }
}

describe("ProjectAdditionalStepComponent canonical form", () => {
  let fixture: ComponentFixture<ProjectAdditionalStepComponent>;
  let service: ProjectAdditionalService;
  let response: Subject<ProgramLinkFields>;
  const repo = { getProgramLinkFields: vi.fn(), updateProgramLinkFields: vi.fn() };

  beforeEach(async () => {
    response = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields.mockReset().mockReturnValue(response);
    repo.updateProgramLinkFields.mockReset().mockReturnValue(of(undefined));
    await TestBed.configureTestingModule({
      imports: [ProjectAdditionalStepComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        provideNgxMask(),
        ProjectAdditionalService,
        { provide: ProjectProgramRepositoryPort, useValue: repo },
        { provide: ProgramRepositoryPort, useValue: {} },
        { provide: LoggerService, useValue: { error: vi.fn() } },
        { provide: TooltipInfoService, useValue: { isVisible: () => false } },
      ],
    }).compileComponents();
    service = TestBed.inject(ProjectAdditionalService);
    service.setContext(55, 700);
    fixture = TestBed.createComponent(ProjectAdditionalStepComponent);
    await fixture.whenStable();
  });

  function caseSelect(): SelectComponent {
    return fixture.debugElement
      .queryAll(By.directive(SelectComponent))
      .find(element => element.nativeElement.id === "case")!.componentInstance;
  }

  it("loading is distinct from empty; an asynchronous GET renders blank case with explicit placeholder", async () => {
    expect(fixture.nativeElement.textContent).toContain("Загружаем дополнительные сведения");
    expect(fixture.nativeElement.textContent).not.toContain("полей для заполнения нет");
    response.next(programLinkFields());
    await fixture.whenStable();
    expect(caseSelect().placeholder()).toBe("Выберите кейс");
    expect(caseSelect().selectedId).toBeUndefined();
    expect(service.getAdditionalForm().get("case")?.value).toBe("");
    expect(
      fixture.nativeElement.querySelector("app-select#case .field__input")?.textContent,
    ).toContain("Выберите кейс");
    expect(
      fixture.nativeElement.querySelector("app-select#track .field__input")?.textContent,
    ).toContain("Y");
  });

  it("saved B is restored on opening and an explicit dropdown choice updates the control", async () => {
    const snapshot = programLinkFields();
    snapshot.fields[0].value = "B";
    response.next(snapshot);
    await fixture.whenStable();
    const display: HTMLElement = fixture.nativeElement.querySelector(
      "app-select#case .field__input",
    );
    expect(display.textContent?.trim()).toBe("B");
    display.click();
    await fixture.whenStable();
    const option = Array.from(document.querySelectorAll<HTMLElement>(".field__option")).find(
      element => element.querySelector("p")?.textContent?.trim() === "A",
    )!;
    option.click();
    await fixture.whenStable();
    expect(service.getAdditionalForm().get("case")?.value).toBe("A");
    expect(display.textContent?.trim()).toBe("A");
  });

  it("required case error says Выберите кейс", async () => {
    response.next(programLinkFields());
    const host = TestBed.createComponent(SubmitHost);
    await host.whenStable();
    host.nativeElement.querySelector("button").click();
    await host.whenStable();
    expect(host.nativeElement.querySelector(".error")?.textContent.trim()).toBe("Выберите кейс");
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
  });

  it("GET error shows controlled message and retry, not an empty state", async () => {
    response.error(new HttpErrorResponse({ status: 500, error: "raw backend body" }));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(
      "Не удалось загрузить дополнительные сведения программы.",
    );
    expect(fixture.nativeElement.textContent).not.toContain("raw backend");
    repo.getProgramLinkFields.mockReturnValue(of(programLinkFields({ fields: [] })));
    fixture.nativeElement.querySelector("button").click();
    await fixture.whenStable();
    expect(repo.getProgramLinkFields.mock.calls).toEqual([[700], [700]]);
    expect(fixture.nativeElement.textContent).toContain("полей для заполнения нет");
  });

  it("submitted fields are visible but disabled and boolean controls are read-only", async () => {
    const snapshot = programLinkFields({ submitted: true });
    snapshot.fields[0].value = "B";
    response.next(snapshot);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain(
      "Проект уже сдан. Дополнительные сведения изменить нельзя.",
    );
    expect(caseSelect().disabled).toBe(true);
    expect(
      fixture.nativeElement.querySelector("app-select#case .field__input")?.textContent.trim(),
    ).toBe("B");
    expect(fixture.nativeElement.querySelector("app-checkbox")).toBeNull();
    await firstValueFrom(service.save(700, false));
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
  });

  it("preserves a frozen saved case even if it is no longer an available option", async () => {
    const snapshot = programLinkFields({ submitted: true });
    snapshot.fields[0].value = "Previously available case";
    response.next(snapshot);
    await fixture.whenStable();
    expect(service.getAdditionalForm().get("case")?.value).toBe("Previously available case");
    expect(service.getAdditionalForm().get("case")?.disabled).toBe(true);
    expect(
      fixture.nativeElement.querySelector('[data-testid="saved-field-value"]')?.textContent.trim(),
    ).toBe("Previously available case");
    expect(fixture.nativeElement.textContent).not.toContain("больше недоступен");
  });
});
