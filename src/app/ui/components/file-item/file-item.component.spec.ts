/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FileItemComponent } from "./file-item.component";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";

describe("FileItemComponent", () => {
  let component: FileItemComponent;
  let fixture: ComponentFixture<FileItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FileItemComponent, FileTypePipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FileItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
