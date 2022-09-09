/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileDetailComponent } from "./profile-detail.component";
import { of } from "rxjs";
import { AuthService } from "../../../auth/services";
import { RouterTestingModule } from "@angular/router/testing";

describe("ProfileDetailComponent", () => {
  let component: ProfileDetailComponent;
  let fixture: ComponentFixture<ProfileDetailComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj([{ profile: of({}) }]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
      declarations: [ProfileDetailComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
