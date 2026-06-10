/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { ProfileInfoComponent } from "./profile-info.component";
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

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
