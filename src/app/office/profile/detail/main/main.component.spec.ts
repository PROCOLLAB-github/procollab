/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ProfileMainComponent } from "./main.component";
import { AuthService } from "@auth/services";

describe("MainComponent", () => {
  let component: ProfileMainComponent;
  let fixture: ComponentFixture<ProfileMainComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", {}, { profile: of({}) });

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ProfileMainComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
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
