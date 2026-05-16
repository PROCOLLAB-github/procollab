/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatMessageComponent } from "./chat-message.component";
import { ChatMessage } from "@domain/chat/chat-message.model";
import { of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";
import { AuthRepository } from "@infrastructure/repository/auth/auth.repository";

describe("ChatMessageComponent", () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ChatMessageComponent],
      providers: [{ provide: AuthRepository, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    component.chatMessage = {
      id: 1,
      isEdited: false,
      isRead: false,
      isDeleted: false,
      replyTo: null,
      text: "",
      createdAt: "",
      files: [],
    } as unknown as ChatMessage;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
