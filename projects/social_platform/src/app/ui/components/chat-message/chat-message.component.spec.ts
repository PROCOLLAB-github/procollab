/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatMessageComponent } from "./chat-message.component";
import { ChatMessage } from "projects/social_platform/src/app/domain/chat/chat-message.model";
import { AuthService } from "@auth/services";
import { of } from "rxjs";
import { RouterTestingModule } from "@angular/router/testing";

describe("ChatMessageComponent", () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  beforeEach(async () => {
    const authSpy = {
      profile: of({}),
    };

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ChatMessageComponent],
      providers: [{ provide: AuthService, useValue: authSpy }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    component.chatMessage = ChatMessage.default();
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
