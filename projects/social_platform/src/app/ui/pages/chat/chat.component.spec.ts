/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ChatComponent } from "./chat.component";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { ChatInfoService } from "@api/chat/facades/chat-info.service";
import { ChatUIInfoService } from "@api/chat/facades/ui/chat-ui-info.service";

describe("ChatComponent", () => {
  let component: ChatComponent;
  let fixture: ComponentFixture<ChatComponent>;

  beforeEach(async () => {
    const chatInfoServiceSpy = {
      chats: of([]),
      initializationChats: jasmine.createSpy("initializationChats"),
      destroy: jasmine.createSpy("destroy"),
      onGotoChat: jasmine.createSpy("onGotoChat"),
    };

    const chatUIInfoServiceSpy = {
      chatsData: signal([]),
    };

    await TestBed.configureTestingModule({
      imports: [ChatComponent],
      providers: [provideRouter([])],
    })
      .overrideComponent(ChatComponent, {
        remove: { providers: [ChatInfoService, ChatUIInfoService] },
        add: {
          providers: [
            { provide: ChatInfoService, useValue: chatInfoServiceSpy },
            { provide: ChatUIInfoService, useValue: chatUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
