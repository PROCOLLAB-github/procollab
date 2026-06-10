/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FileItemComponent } from "./file-item.component";
import { FileTypePipe } from "@ui/pipes/file-type.pipe";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { API_URL } from "@corelib";

describe("FileItemComponent", () => {
  let component: FileItemComponent;
  let fixture: ComponentFixture<FileItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, FileItemComponent, FileTypePipe],
      providers: [{ provide: API_URL, useValue: "" }],
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
