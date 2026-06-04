/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { UploadFileComponent } from "./upload-file.component";
import { FileService } from "projects/core/src/lib/services/file/file.service";
import { of } from "rxjs";

describe("UploadFileComponent", () => {
  let component: UploadFileComponent;
  let fixture: ComponentFixture<UploadFileComponent>;
  let fileServiceSpy: any;

  beforeEach(() => {
    fileServiceSpy = {
      uploadFile: vi.fn().mockReturnValue(of({})),
      deleteFile: vi.fn().mockReturnValue(of({})),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, UploadFileComponent],
      providers: [{ provide: FileService, useValue: fileServiceSpy }],
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
});
