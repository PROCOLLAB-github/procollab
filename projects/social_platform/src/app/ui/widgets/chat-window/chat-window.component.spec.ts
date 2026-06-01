/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatWindowComponent } from "./chat-window.component";
import { ReactiveFormsModule } from "@angular/forms";
import { of } from "rxjs";
import { provideRouter } from "@angular/router";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { API_URL } from "@corelib";

describe("ChatWindowComponent", () => {
  let component: ChatWindowComponent;
  let fixture: ComponentFixture<ChatWindowComponent>;

  beforeEach(async () => {
    const authSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
      fetchLeaderProjects: of({ results: [], count: 0 }),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule, ChatWindowComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authSpy },
        { provide: API_URL, useValue: "" },
        provideNgxMask(),
        provideRouter([]),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatWindowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
