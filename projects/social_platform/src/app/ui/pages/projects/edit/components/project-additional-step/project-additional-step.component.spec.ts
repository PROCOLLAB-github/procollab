/** @format */
import { HttpErrorResponse } from "@angular/common/http";
import { provideZonelessChangeDetection } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { firstValueFrom, of, Subject } from "rxjs";
import { FileService } from "@corelib";
import { LoggerService } from "@core/lib/services/logger/logger.service";
import { ProjectAdditionalService } from "@api/project/facades/edit/project-additional.service";
import { ProjectProgramRepositoryPort } from "@domain/project/ports/project-program.repository.port";
import { ProgramRepositoryPort } from "@domain/program/ports/program.repository.port";
import { programLinkFields } from "@domain/project/program-link-fields.fixture";
import { ProgramLinkFields } from "@domain/project/program-link-fields.model";
import { ProjectAdditionalStepComponent } from "./project-additional-step.component";

describe("ProjectAdditionalStepComponent common form", () => {
  let fixture: ComponentFixture<ProjectAdditionalStepComponent>;
  let service: ProjectAdditionalService;
  let response: Subject<ProgramLinkFields>;
  const repo = { getProgramLinkFields: vi.fn(), updateProgramLinkFields: vi.fn() };
  const programRepo = { submitCompettetiveProject: vi.fn() };
  const files = { uploadFile: vi.fn() };
  beforeEach(async () => {
    response = new Subject<ProgramLinkFields>();
    repo.getProgramLinkFields.mockReset().mockReturnValue(response);
    repo.updateProgramLinkFields.mockReset().mockReturnValue(of(undefined));
    programRepo.submitCompettetiveProject.mockReset().mockReturnValue(of({}));
    files.uploadFile.mockReset();
    await TestBed.configureTestingModule({
      imports: [ProjectAdditionalStepComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ProjectAdditionalService,
        { provide: ProjectProgramRepositoryPort, useValue: repo },
        { provide: ProgramRepositoryPort, useValue: programRepo },
        { provide: LoggerService, useValue: { error: vi.fn() } },
        { provide: FileService, useValue: files },
      ],
    }).compileComponents();
    service = TestBed.inject(ProjectAdditionalService);
    service.setContext(55, 700);
    fixture = TestBed.createComponent(ProjectAdditionalStepComponent);
    await fixture.whenStable();
  });
  it("distinguishes loading, error, retry and empty", async () => {
    expect(fixture.nativeElement.textContent).toContain("Загружаем дополнительные сведения");
    response.error(new HttpErrorResponse({ status: 500 }));
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Не удалось загрузить");
    repo.getProgramLinkFields.mockReturnValue(of(programLinkFields({ fields: [] })));
    fixture.nativeElement.querySelector("button").click();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("полей для заполнения нет");
  });
  it("restores saved case and changes it through the labelled native selector", async () => {
    const data = programLinkFields();
    data.fields[0].value = "B";
    response.next(data);
    await fixture.whenStable();
    const select = fixture.nativeElement.querySelector("#answer-case") as HTMLSelectElement;
    expect(select.value).toBe("B");
    select.value = "A";
    select.dispatchEvent(new Event("change"));
    await fixture.whenStable();
    expect(service.getAdditionalForm().get("case")?.value).toBe("A");
    expect(fixture.nativeElement.querySelector('label[for="answer-case"]')).not.toBeNull();
  });
  it("empty draft saves; required errors appear only at submission and preserve values", async () => {
    response.next(programLinkFields());
    await fixture.whenStable();
    service.getAdditionalForm().markAllAsTouched();
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[aria-invalid="true"]')).toBeNull();
    expect((await firstValueFrom(service.save(700, false))).ok).toBe(true);
    expect((await firstValueFrom(service.save(700, true))).ok).toBe(false);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain("Выберите кейс.");
    expect(service.getAdditionalForm().get("track")?.value).toBe("Y");
    expect(programRepo.submitCompettetiveProject).not.toHaveBeenCalled();
  });
  it("submitted values are disabled and missing historic case options remain visible", async () => {
    const data = programLinkFields({ submitted: true });
    data.fields[0].value = "Старый кейс";
    response.next(data);
    await fixture.whenStable();
    expect(
      fixture.nativeElement.querySelector('[data-testid="saved-field-value"]').textContent,
    ).toContain("Старый кейс");
    expect(fixture.nativeElement.querySelector("#answer-track").disabled).toBe(true);
    expect(fixture.nativeElement.querySelector("input[type=checkbox]").disabled).toBe(true);
    await firstValueFrom(service.save(700, false));
    expect(repo.updateProgramLinkFields).not.toHaveBeenCalled();
  });
  it("uploads through FileService, blocks save while pending, then saves URL with the link", async () => {
    const data = programLinkFields();
    data.fields.push({
      ...data.fields[2],
      id: 55,
      name: "document",
      label: "Финансовая модель",
      fieldType: "file",
      isRequired: true,
      value: null,
    });
    response.next(data);
    await fixture.whenStable();
    const uploaded = new Subject<{ url: string }>();
    files.uploadFile.mockReturnValue(uploaded);
    const input = fixture.nativeElement.querySelector("input[type=file]");
    Object.defineProperty(input, "files", { value: [new File(["data"], "model.pdf")] });
    input.dispatchEvent(new Event("change"));
    await fixture.whenStable();
    expect(files.uploadFile).toHaveBeenCalledOnce();
    expect(service.uploading()).toBe(true);
    expect((await firstValueFrom(service.save(700, false))).ok).toBe(false);
    uploaded.next({ url: "https://example.com/model.pdf" });
    uploaded.complete();
    await fixture.whenStable();
    expect(service.uploading()).toBe(false);
    expect(service.getAdditionalForm().get("document")?.value).toBe(
      "https://example.com/model.pdf",
    );
    await firstValueFrom(service.save(700, false));
    expect(repo.updateProgramLinkFields.mock.calls[0][1]).toContainEqual({
      fieldId: 55,
      valueText: "https://example.com/model.pdf",
    });
  });
});
