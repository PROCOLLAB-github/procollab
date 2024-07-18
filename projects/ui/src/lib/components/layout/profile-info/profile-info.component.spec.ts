/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "@auth/services";
import { ProfileInfoComponent } from "./profile-info.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileInfoComponent", () => {
  let component: ProfileInfoComponent;
  let fixture: ComponentFixture<ProfileInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ProfileInfoComponent],
      providers: [AuthService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileInfoComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
