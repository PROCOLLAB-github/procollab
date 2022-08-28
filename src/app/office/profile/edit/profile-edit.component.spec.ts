/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileEditComponent } from "./profile-edit.component";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";

describe("EditComponent", () => {
  let component: ProfileEditComponent;
  let fixture: ComponentFixture<ProfileEditComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    await TestBed.configureTestingModule({
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
