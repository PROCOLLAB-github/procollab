/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectEditComponent } from "./edit.component";
import { RouterTestingModule } from "@angular/router/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CoreModule } from "@core/core.module";
import { UiModule } from "@ui/ui.module";
import { NgxMaskModule } from "ngx-mask";
import { AuthService } from "@auth/services";

describe("ProjectEditComponent", () => {
  let component: ProjectEditComponent;
  let fixture: ComponentFixture<ProjectEditComponent>;

  beforeEach(async () => {
    const authSpy = {};

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        CoreModule,
        UiModule,
        NgxMaskModule.forRoot(),
      ],
      providers: [{ provide: AuthService, useValue: authSpy }],
      declarations: [ProjectEditComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
