/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { AvatarControlComponent } from "./avatar-control.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { API_URL } from "@corelib";
import { of } from "rxjs";

describe("AvatarControlComponent", () => {
  let component: AvatarControlComponent;
  let fixture: ComponentFixture<AvatarControlComponent>;

  beforeEach(async () => {
    const authSpy = {
      fetchProfile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AvatarControlComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authSpy },
        { provide: API_URL, useValue: "" },
      ],
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
