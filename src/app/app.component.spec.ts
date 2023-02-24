/** @format */

import { TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { AppComponent } from "./app.component";
import { AuthService } from "@auth/services";

describe("AppComponent", () => {
  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["getTokens"]);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, RouterTestingModule],
      providers: [{ provide: AuthService, useValue: authSpy }],
      declarations: [AppComponent],
    }).compileComponents();
  });

  it("should create the app", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
