/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { MessageInputComponent } from "./message-input.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { provideNgxMask } from "ngx-mask";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { API_URL } from "@corelib";
import { of } from "rxjs";

describe("MessageInputComponent", () => {
  let component: MessageInputComponent;
  let fixture: ComponentFixture<MessageInputComponent>;

  beforeEach(async () => {
    const authSpy = {
      fetchProfile: of({}),
      fetchUserRoles: of([]),
      fetchChangeableRoles: of([]),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MessageInputComponent],
      providers: [
        { provide: AuthRepositoryPort, useValue: authSpy },
        { provide: API_URL, useValue: "" },
        provideNgxMask(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
