/** @format */

import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ChatDirectComponent } from "./chat-direct.component";
import { provideRouter } from "@angular/router";
import { signal } from "@angular/core";
import { of } from "rxjs";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { ChatDirectInfoService } from "@api/chat/facades/chat-direct-info.service";
import { ChatDirectUIInfoService } from "@api/chat/facades/ui/chat-direct-ui-info.service";
import { AuthRepositoryPort } from "@domain/auth/ports/auth.repository.port";
import { API_URL } from "@corelib";
import { provideNgxMask } from "ngx-mask";

describe("ChatDirectComponent", () => {
  let component: ChatDirectComponent;
  let fixture: ComponentFixture<ChatDirectComponent>;

  beforeEach(async () => {
    const chatDirectInfoServiceSpy = {
      typingPersons: signal([]),
      chat: signal(undefined),
      messages: signal([]),
      initializationChatDirect: jasmine.createSpy("initializationChatDirect"),
      destroy: jasmine.createSpy("destroy"),
      onSubmitMessage: jasmine.createSpy("onSubmitMessage"),
      onEditMessage: jasmine.createSpy("onEditMessage"),
      onDeleteMessage: jasmine.createSpy("onDeleteMessage"),
      onFetchMessages: jasmine.createSpy("onFetchMessages"),
      onType: jasmine.createSpy("onType"),
      onReadMessage: jasmine.createSpy("onReadMessage"),
    };

    const chatDirectUIInfoServiceSpy = {
      currentUserId: signal(undefined),
      fetching: signal(false),
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ChatDirectComponent],
      providers: [
        provideRouter([]),
        provideNgxMask(),
        { provide: AuthRepositoryPort, useValue: { fetchProfile: of({}), fetchUserRoles: of([]), fetchChangeableRoles: of([]), fetchLeaderProjects: of({}) } },
        { provide: API_URL, useValue: "" },
      ],
    })
      .overrideComponent(ChatDirectComponent, {
        remove: {
          providers: [ChatDirectInfoService, ChatDirectUIInfoService],
        },
        add: {
          providers: [
            { provide: ChatDirectInfoService, useValue: chatDirectInfoServiceSpy },
            { provide: ChatDirectUIInfoService, useValue: chatDirectUIInfoServiceSpy },
          ],
        },
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatDirectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
