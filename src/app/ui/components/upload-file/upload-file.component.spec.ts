/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { UploadFileComponent } from "./upload-file.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "../../../auth/services";

describe("UploadFileComponent", () => {
  let component: UploadFileComponent;
  let fixture: ComponentFixture<UploadFileComponent>;

  beforeEach(async () => {
    const authSpy = {};
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
      declarations: [UploadFileComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
