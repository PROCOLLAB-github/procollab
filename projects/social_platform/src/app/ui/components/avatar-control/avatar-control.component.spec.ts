/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AvatarControlComponent } from "./avatar-control.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

describe("AvatarControlComponent", () => {
  let component: AvatarControlComponent;
  let fixture: ComponentFixture<AvatarControlComponent>;

  beforeEach(async () => {
    const autSpy = jasmine.createSpyObj(["getTokens"]);

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AvatarControlComponent],
      providers: [{ provide: AuthRepository, useValue: autSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvatarControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
