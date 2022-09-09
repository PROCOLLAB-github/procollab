/** @format */

/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileEditComponent } from "./edit.component";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";
import { ReactiveFormsModule } from "@angular/forms";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { CoreModule } from "../../../core/core.module";
import { UiModule } from "../../../ui/ui.module";
import { NgxMaskModule } from "ngx-mask";

describe("ProfileEditComponent", () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

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
      declarations: [ProfileEditComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
