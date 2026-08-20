/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { of, throwError } from "rxjs";
import { API_URL } from "@corelib";
import { FileService } from "@core/lib/services/file/file.service";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";
import { ProjectNewsRepository as ProjectNewsService } from "@infrastructure/repository/project/project-news.repository";
import { NewsFormComponent } from "./news-form.component";

describe("NewsFormComponent", () => {
  let component: NewsFormComponent;
  let fixture: ComponentFixture<NewsFormComponent>;
  let fileService: {
    uploadFile: ReturnType<typeof vi.fn>;
    deleteFile: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    const projectNewsServiceSpy = { addNews: vi.fn() };
    const authSpy = {
      profile: of({}),
    };
    fileService = {
      uploadFile: vi.fn(file => of({ url: `https://cdn.example.com/${file.name}` })),
      deleteFile: vi.fn(() => of({ success: true })),
    };

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NewsFormComponent,
      ],
      providers: [
        { provide: ProjectNewsService, useValue: projectNewsServiceSpy },
        { provide: AuthRepository, useValue: authSpy },
        { provide: FileService, useValue: fileService },
        { provide: API_URL, useValue: "" },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("emits uploaded file URLs without clearing the form before parent success", () => {
    const emitSpy = vi.spyOn(component.addNews, "emit");
    component.messageForm.patchValue({ text: "News text" });
    component.imagesList.set([
      {
        id: "img",
        src: "https://cdn.example.com/image.png",
        loading: false,
        error: false,
        tempFile: null,
      },
    ]);

    component.onSubmit();

    expect(emitSpy).toHaveBeenCalledExactlyOnceWith({
      text: "News text",
      files: ["https://cdn.example.com/image.png"],
    });
    expect(component.messageForm.value.text).toBe("News text");
    expect(component.imagesList()).toHaveLength(1);
  });

  it("does not submit while an attachment is uploading", () => {
    const emitSpy = vi.spyOn(component.addNews, "emit");
    component.messageForm.patchValue({ text: "News text" });
    component.imagesList.set([
      {
        id: "img",
        src: "",
        loading: true,
        error: false,
        tempFile: createFile("image.png", "image/png"),
      },
    ]);

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("does not submit attachments with upload errors", () => {
    const emitSpy = vi.spyOn(component.addNews, "emit");
    component.messageForm.patchValue({ text: "News text" });
    component.filesList.set([
      {
        id: "doc",
        src: "",
        loading: false,
        error: "Ошибка загрузки",
        tempFile: createFile("doc.pdf", "application/pdf"),
      },
    ]);

    component.onSubmit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it("keeps the matching source file for each failed multi-file upload", () => {
    const first = createFile("first.png", "image/png");
    const second = createFile("second.png", "image/png");
    fileService.uploadFile.mockImplementation(file =>
      file.name === "second.png"
        ? throwError(() => new Error("upload failed"))
        : of({ url: `https://cdn.example.com/${file.name}` }),
    );

    component.uploadFiles(createFileList([first, second]));

    expect(fileService.uploadFile).toHaveBeenNthCalledWith(1, first);
    expect(fileService.uploadFile).toHaveBeenNthCalledWith(2, second);
    expect(component.imagesList()[1].tempFile).toBe(second);
    expect(component.imagesList()[1].error).toBe(true);
  });

  it("deletes regular files by URL from filesList", () => {
    const document = createFile("doc.pdf", "application/pdf");
    component.imagesList.set([
      {
        id: "img",
        src: "https://cdn.example.com/image.png",
        loading: false,
        error: false,
        tempFile: null,
      },
    ]);
    component.filesList.set([
      {
        id: "doc",
        src: "https://cdn.example.com/doc.pdf",
        loading: false,
        error: "",
        tempFile: document,
      },
    ]);

    component.onDeleteFile("doc");

    expect(fileService.deleteFile).toHaveBeenCalledExactlyOnceWith(
      "https://cdn.example.com/doc.pdf",
    );
    expect(component.filesList()).toHaveLength(0);
  });

  it("retries regular file upload and includes the returned URL in submit payload", () => {
    const emitSpy = vi.spyOn(component.addNews, "emit");
    const document = createFile("doc.pdf", "application/pdf");
    component.messageForm.patchValue({ text: "News text" });
    component.filesList.set([
      {
        id: "doc",
        src: "",
        loading: false,
        error: "Ошибка загрузки",
        tempFile: document,
      },
    ]);

    component.onRetryFile("doc");
    component.onSubmit();

    expect(fileService.uploadFile).toHaveBeenCalledWith(document);
    expect(component.filesList()[0].loading).toBe(false);
    expect(component.filesList()[0].error).toBe("");
    expect(emitSpy).toHaveBeenCalledExactlyOnceWith({
      text: "News text",
      files: ["https://cdn.example.com/doc.pdf"],
    });
  });
});

function createFile(name: string, type: string): File {
  return new File(["content"], name, { type });
}

function createFileList(files: File[]): FileList {
  return {
    ...Object.fromEntries(files.map((file, index) => [index, file])),
    length: files.length,
    item: (index: number) => files[index] ?? null,
  } as unknown as FileList;
}
