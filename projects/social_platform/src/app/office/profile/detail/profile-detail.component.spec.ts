/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProfileDetailComponent } from "./profile-detail.component";
import { of } from "rxjs";
import { AuthService } from "@auth/services";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileDetailComponent", () => {
  let component: ProfileDetailComponent;
  let fixture: ComponentFixture<ProfileDetailComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", {}, { profile: of({}) });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ProfileDetailComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
