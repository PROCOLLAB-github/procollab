/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ProfileMainComponent } from "./main.component";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

describe("MainComponent", () => {
  let component: ProfileMainComponent;
  let fixture: ComponentFixture<ProfileMainComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthRepository", {}, { profile: of({}) });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ProfileMainComponent],
      providers: [{ provide: AuthRepository, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
