/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { ChatRealtimeRepository } from "./chat-realtime.repository";
import { ChatWsAdapter } from "../../adapters/chat/chat-ws.adapter";
import {
  OnChangeStatus,
  OnChatMessageDto,
  OnDeleteChatMessageDto,
  OnEditChatMessageDto,
  OnReadChatMessageDto,
  TypingInChatEventDto,
} from "@domain/chat/chat.model";

describe("ChatRealtimeRepository", () => {
  let repository: ChatRealtimeRepository;
  let adapter: jasmine.SpyObj<ChatWsAdapter>;

  beforeEach(() => {
    adapter = jasmine.createSpyObj<ChatWsAdapter>("ChatWsAdapter", [
      "connect",
      "sendMessage",
      "editMessage",
      "deleteMessage",
      "readMessage",
      "startTyping",
      "onMessage",
      "onEditMessage",
      "onDeleteMessage",
      "onReadMessage",
      "onTyping",
      "onSetOnline",
      "onSetOffline",
    ]);

    adapter.connect.and.returnValue(of(undefined));
    adapter.onMessage.and.returnValue(of({} as OnChatMessageDto));
    adapter.onEditMessage.and.returnValue(of({} as OnEditChatMessageDto));
    adapter.onDeleteMessage.and.returnValue(of({} as OnDeleteChatMessageDto));
    adapter.onReadMessage.and.returnValue(of({} as OnReadChatMessageDto));
    adapter.onTyping.and.returnValue(of({} as TypingInChatEventDto));
    adapter.onSetOnline.and.returnValue(of({} as OnChangeStatus));
    adapter.onSetOffline.and.returnValue(of({} as OnChangeStatus));

    TestBed.configureTestingModule({
      providers: [ChatRealtimeRepository, { provide: ChatWsAdapter, useValue: adapter }],
    });

    repository = TestBed.inject(ChatRealtimeRepository);
  });

  it("делегирует connect в WS adapter", () => {
    repository.connect().subscribe();

    expect(adapter.connect).toHaveBeenCalledOnceWith();
  });

  it("делегирует send/edit/delete/read/startTyping в WS adapter", () => {
    const sendPayload = {} as never;
    const editPayload = {} as never;
    const deletePayload = {} as never;
    const readPayload = {} as never;
    const typingPayload = {} as never;

    repository.sendMessage(sendPayload);
    repository.editMessage(editPayload);
    repository.deleteMessage(deletePayload);
    repository.readMessage(readPayload);
    repository.startTyping(typingPayload);

    expect(adapter.sendMessage).toHaveBeenCalledOnceWith(sendPayload);
    expect(adapter.editMessage).toHaveBeenCalledOnceWith(editPayload);
    expect(adapter.deleteMessage).toHaveBeenCalledOnceWith(deletePayload);
    expect(adapter.readMessage).toHaveBeenCalledOnceWith(readPayload);
    expect(adapter.startTyping).toHaveBeenCalledOnceWith(typingPayload);
  });

  it("делегирует event subscriptions в WS adapter", () => {
    repository.onMessage().subscribe();
    repository.onEditMessage().subscribe();
    repository.onDeleteMessage().subscribe();
    repository.onReadMessage().subscribe();
    repository.onTyping().subscribe();
    repository.onSetOnline().subscribe();
    repository.onSetOffline().subscribe();

    expect(adapter.onMessage).toHaveBeenCalledOnceWith();
    expect(adapter.onEditMessage).toHaveBeenCalledOnceWith();
    expect(adapter.onDeleteMessage).toHaveBeenCalledOnceWith();
    expect(adapter.onReadMessage).toHaveBeenCalledOnceWith();
    expect(adapter.onTyping).toHaveBeenCalledOnceWith();
    expect(adapter.onSetOnline).toHaveBeenCalledOnceWith();
    expect(adapter.onSetOffline).toHaveBeenCalledOnceWith();
  });
});
