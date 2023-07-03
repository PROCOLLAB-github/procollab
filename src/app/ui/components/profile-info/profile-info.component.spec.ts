/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { ProfileInfoComponent } from "./profile-info.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileInfoComponent", () => {
  let component: ProfileInfoComponent;
  let fixture: ComponentFixture<ProfileInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [ProfileInfoComponent],
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

  it("should display user info when user is provided", () => {
    const user = User.default();
    component.user = user;
    fixture.detectChanges();

    const name = fixture.nativeElement.querySelector(".user__name");

    expect(name.textContent).toContain(user.firstName);
    expect(name.textContent).toContain(user.lastName);
  });
});
