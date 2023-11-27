/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FileUploadItemComponent } from "./file-upload-item.component";
import { RouterTestingModule } from "@angular/router/testing";

describe("FileUploadItemComponent", () => {
  let component: FileUploadItemComponent;
  let fixture: ComponentFixture<FileUploadItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FileUploadItemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileUploadItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
