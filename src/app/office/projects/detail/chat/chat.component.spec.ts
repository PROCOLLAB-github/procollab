/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ProjectChatComponent } from "./chat.component";
import { ReactiveFormsModule } from "@angular/forms";
import { MessageInputComponent } from "@office/shared/message-input/message-input.component";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AuthService } from "@auth/services";

describe("ChatComponent", () => {
  let component: ProjectChatComponent;
  let fixture: ComponentFixture<ProjectChatComponent>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj("AuthService", ["profile"]);

    await TestBed.configureTestingModule({
      declarations: [ProjectChatComponent, MessageInputComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
