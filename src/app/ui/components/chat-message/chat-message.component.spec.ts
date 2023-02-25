/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ChatMessageComponent } from "./chat-message.component";
import { UiModule } from "@ui/ui.module";
import { ChatMessage } from "@models/chat-message";

describe("ChatMessageComponent", () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UiModule],
      declarations: [ChatMessageComponent],
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
