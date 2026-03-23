/** @format */

import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { AuthRepository } from "projects/social_platform/src/app/infrastructure/repository/auth/auth.repository";

describe("AppComponent", () => {
  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthRepository", ["getTokens"]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, AppComponent],
      providers: [{ provide: AuthRepository, useValue: authSpy }],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
