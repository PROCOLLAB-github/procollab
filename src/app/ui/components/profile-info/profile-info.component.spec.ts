/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthService } from "@auth/services";
import { User } from "@auth/models/user.model";
import { ProfileInfoComponent } from "./profile-info.component";
import { By } from "@angular/platform-browser";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileInfoComponent", () => {
  let component: ProfileInfoComponent;
  let fixture: ComponentFixture<ProfileInfoComponent>;
  let authService: AuthService;

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
    authService = TestBed.inject(AuthService);
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should display user info when user is provided", () => {
    const user = User.default();
    component.user = user;
    fixture.detectChanges();

    const avatar = fixture.debugElement.query(By.css(".user__avatar"));
    const name = fixture.debugElement.query(By.css(".user__name")).nativeElement;
    const email = fixture.debugElement.query(By.css(".user__email")).nativeElement;

    expect(avatar.componentInstance.url).toBe(user.avatar);
    expect(name.textContent).toContain(user.firstName);
    expect(name.textContent).toContain(user.lastName);
    expect(email.textContent).toBe(user.email);
  });
});
