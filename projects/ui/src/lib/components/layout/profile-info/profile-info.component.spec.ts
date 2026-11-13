/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ProfileInfoComponent } from "./profile-info.component";
import { FORCED_THEME_SCHEME } from "../../../services/theme.service";
import { User } from "@domain/auth/user.model";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileInfoComponent", () => {
  let component: ProfileInfoComponent;
  let fixture: ComponentFixture<ProfileInfoComponent>;

  beforeEach(async () => {
    // Компонент зависит только от Router. AuthService удалён.
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ProfileInfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileInfoComponent);
    component = fixture.componentInstance;
  });

  it("hides theme controls when the instance fixes its theme", async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule, ProfileInfoComponent],
      providers: [{ provide: FORCED_THEME_SCHEME, useValue: "light" }],
    }).compileComponents();
    const pilot = TestBed.createComponent(ProfileInfoComponent);
    pilot.componentRef.setInput("user", { id: 1, personal: { avatar: null } } as unknown as User);
    pilot.detectChanges();
    pilot.nativeElement.querySelector("button.user").click();
    pilot.detectChanges();
    expect(pilot.nativeElement.querySelector('[aria-label="Тема оформления"]')).toBeNull();
    expect(pilot.nativeElement.textContent).toContain("Мой профиль");
  });
  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
