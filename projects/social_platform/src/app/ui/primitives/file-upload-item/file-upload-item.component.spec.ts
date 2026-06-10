/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FileUploadItemComponent } from "./file-upload-item.component";
import { provideRouter } from "@angular/router";
import { CommonModule } from "@angular/common";

describe("FileUploadItemComponent", () => {
  let component: FileUploadItemComponent;
  let fixture: ComponentFixture<FileUploadItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FileUploadItemComponent],
      providers: [provideRouter([])],
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
