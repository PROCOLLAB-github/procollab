/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { UploadFileComponent } from "./upload-file.component";
import { FileService } from "@core/services/file.service";

describe("UploadFileComponent", () => {
  let component: UploadFileComponent;
  let fixture: ComponentFixture<UploadFileComponent>;
  let fileServiceSpy: jasmine.SpyObj<FileService>;

  beforeEach(() => {
    fileServiceSpy = jasmine.createSpyObj("FileService", ["uploadFile"]);

    TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [UploadFileComponent],
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
    spyOn(component, "onUpdate");

    const input = fixture.nativeElement.querySelector("input[type=file]");
    const event = new Event("change");
    input.dispatchEvent(event);

    expect(component.onUpdate).toHaveBeenCalledWith(event);
  });

  it("should clear value and emit change event when delete button is clicked", () => {
    spyOn(component, "onTouch");
    spyOn(component, "onChange");

    component.value = "http://example.com/image.png";
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(".file__basket");
    button.dispatchEvent(new Event("click"));

    expect(component.value).toBeFalsy();
    expect(component.onTouch).toHaveBeenCalled();
    expect(component.onChange).toHaveBeenCalledWith("");
  });
});
