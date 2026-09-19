/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { UploadFileComponent } from "./upload-file.component";
import { FileService } from "projects/core/src/lib/services/file/file.service";
import { of, Subject, throwError } from "rxjs";
import { HttpErrorResponse } from "@angular/common/http";
import { SnackbarService } from "@domain/shared/snackbar.service";

describe("UploadFileComponent", () => {
  let component: UploadFileComponent;
  let fixture: ComponentFixture<UploadFileComponent>;
  let fileServiceSpy: any;
  let snackbar: { error: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    fileServiceSpy = {
      uploadFile: vi.fn().mockReturnValue(of({})),
      deleteFile: vi.fn().mockReturnValue(of({})),
    };
    snackbar = { error: vi.fn() };

    TestBed.configureTestingModule({
      imports: [FormsModule, UploadFileComponent],
      providers: [
        { provide: FileService, useValue: fileServiceSpy },
        { provide: SnackbarService, useValue: snackbar },
      ],
    });

    fixture = TestBed.createComponent(UploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should upload file and emit change event", () => {
    vi.spyOn(component, "onUpdate");

    const input = fixture.nativeElement.querySelector("input[type=file]");
    const event = new Event("change");
    input.dispatchEvent(event);

    expect(component.onUpdate).toHaveBeenCalledWith(event);
  });

  it.each([
    ["manual-cv.pdf", "application/pdf"],
    ["manual-cv.docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  ])("should keep manual %s upload flow", (name, type) => {
    const file = new File(["cv"], name, { type });
    const url = `https://example.test/${name}`;
    fileServiceSpy.uploadFile.mockReturnValue(of({ url }));
    vi.spyOn(component, "onChange");
    const input = fixture.nativeElement.querySelector("input[type=file]") as HTMLInputElement;
    Object.defineProperty(input, "files", { value: [file] });

    input.dispatchEvent(new Event("change"));

    expect(fileServiceSpy.uploadFile).toHaveBeenCalledExactlyOnceWith(file);
    expect(component.onChange).toHaveBeenCalledExactlyOnceWith(url);
    expect(component.value).toBe(url);
  });

  it("should clear value and emit change event when delete button is clicked", () => {
    vi.spyOn(component, "onTouch");
    vi.spyOn(component, "onChange");

    component.writeValue("http://example.com/image.png");
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(".file__basket");
    button.dispatchEvent(new Event("click"));

    fixture.detectChanges();

    expect(component.value).toBeFalsy();
    expect(component.onTouch).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalledWith("");
  });

  it("should delete attached PROCOLLAB CV and clear accompanyingFile value", () => {
    const url = "https://example.test/PROCOLLAB_CV.pdf";
    vi.spyOn(component, "onChange");
    component.writeValue(url);
    fixture.detectChanges();

    (fixture.nativeElement.querySelector(".file__basket") as HTMLElement).click();

    expect(fileServiceSpy.deleteFile).toHaveBeenCalledExactlyOnceWith(url);
    expect(component.onChange).toHaveBeenCalledExactlyOnceWith("");
    expect(component.value).toBe("");
  });

  it("DELETE 404 завершает идемпотентное удаление устаревшей ссылки", () => {
    fileServiceSpy.deleteFile.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 404 })),
    );
    component.writeValue("https://example.test/missing.pdf");
    vi.spyOn(component, "onChange");
    component.onRemove();
    expect(component.value).toBe("");
    expect(component.onChange).toHaveBeenCalledExactlyOnceWith("");
    expect(component.loading).toBe(false);
    expect(snackbar.error).not.toHaveBeenCalled();
  });

  it.each([0, 400, 403, 500, 503])("DELETE %s сохраняет URL и показывает ошибку", status => {
    fileServiceSpy.deleteFile.mockReturnValue(throwError(() => new HttpErrorResponse({ status })));
    component.writeValue("https://example.test/file.pdf");
    vi.spyOn(component, "onChange");
    component.onRemove();
    expect(component.value).toBe("https://example.test/file.pdf");
    expect(component.onChange).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(snackbar.error).toHaveBeenCalledExactlyOnceWith(
      "Не удалось удалить файл. Попробуйте ещё раз.",
    );
  });

  it("не дублирует DELETE и не очищает новый URL поздним ответом", () => {
    const response = new Subject<any>();
    fileServiceSpy.deleteFile.mockReturnValue(response);
    component.writeValue("https://example.test/old.pdf");
    vi.spyOn(component, "onChange");
    component.onRemove();
    component.onRemove();
    component.writeValue("https://example.test/other-project.pdf");
    response.next({});
    response.complete();
    expect(fileServiceSpy.deleteFile).toHaveBeenCalledTimes(1);
    expect(component.value).toBe("https://example.test/other-project.pdf");
    expect(component.onChange).not.toHaveBeenCalled();
  });

  it("поздний DELETE не очищает заново привязанный control даже при совпадении URL", () => {
    const response = new Subject<any>();
    fileServiceSpy.deleteFile.mockReturnValue(response);
    component.writeValue("https://example.test/shared.pdf");
    vi.spyOn(component, "onChange");
    component.onRemove();
    component.writeValue("https://example.test/shared.pdf");
    response.next({});
    response.complete();
    expect(component.value).toBe("https://example.test/shared.pdf");
    expect(component.onChange).not.toHaveBeenCalled();
  });

  it("после destroy поздний DELETE не меняет родительский control", () => {
    const response = new Subject<any>();
    fileServiceSpy.deleteFile.mockReturnValue(response);
    component.writeValue("https://example.test/file.pdf");
    vi.spyOn(component, "onChange");
    component.onRemove();
    fixture.destroy();
    response.next({});
    response.complete();
    expect(component.onChange).not.toHaveBeenCalled();
  });

  it("ошибка upload сохраняет прежнее значение и обратную связь", () => {
    fileServiceSpy.uploadFile.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 413 })),
    );
    component.writeValue("https://example.test/old.pdf");
    vi.spyOn(component, "onChange");
    component.onUpdate({
      currentTarget: { files: [new File(["test"], "new.pdf")] },
    } as unknown as Event);
    expect(component.value).toBe("https://example.test/old.pdf");
    expect(component.onChange).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(snackbar.error).toHaveBeenCalledWith(
      expect.stringContaining("превышает допустимый размер"),
    );
  });
});
