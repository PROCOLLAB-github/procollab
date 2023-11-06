/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ProfileProjectsComponent } from "./projects.component";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "@auth/services";

describe("ProjectsComponent", () => {
  let component: ProfileProjectsComponent;
  let fixture: ComponentFixture<ProfileProjectsComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", {}, { profile: of({}) });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ProfileProjectsComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
