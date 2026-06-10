/** @format */

import { TestBed } from "@angular/core/testing";
import { of, Subject } from "rxjs";
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
import { WebsocketService } from "@core/public-api";
import { SnackbarService } from "@domain/shared/snackbar.service";

describe("ChatRealtimeRepository", () => {
  let repository: ChatRealtimeRepository;
  let adapter: any;
  let websocketService: any;
  let snackbarService: any;

  beforeEach(() => {
    adapter = {
      connect: vi.fn(),
      sendMessage: vi.fn(),
      editMessage: vi.fn(),
      deleteMessage: vi.fn(),
      readMessage: vi.fn(),
      startTyping: vi.fn(),
      onMessage: vi.fn(),
      onEditMessage: vi.fn(),
      onDeleteMessage: vi.fn(),
      onReadMessage: vi.fn(),
      onTyping: vi.fn(),
      onSetOnline: vi.fn(),
      onSetOffline: vi.fn(),
    };

    adapter.connect.mockReturnValue(of(undefined));
    adapter.onMessage.mockReturnValue(of({} as OnChatMessageDto));
    adapter.onEditMessage.mockReturnValue(of({} as OnEditChatMessageDto));
    adapter.onDeleteMessage.mockReturnValue(of({} as OnDeleteChatMessageDto));
    adapter.onReadMessage.mockReturnValue(of({} as OnReadChatMessageDto));
    adapter.onTyping.mockReturnValue(of({} as TypingInChatEventDto));
    adapter.onSetOnline.mockReturnValue(of({} as OnChangeStatus));
    adapter.onSetOffline.mockReturnValue(of({} as OnChangeStatus));

    websocketService = { connectionLost$: of(undefined) };

    snackbarService = { error: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        ChatRealtimeRepository,
        { provide: ChatWsAdapter, useValue: adapter },
        { provide: WebsocketService, useValue: websocketService },
        { provide: SnackbarService, useValue: snackbarService },
      ],
    });

    repository = TestBed.inject(ChatRealtimeRepository);
  });

  it("делегирует connect в WS adapter", () => {
    repository.connect().subscribe();

    expect(adapter.connect).toHaveBeenCalledExactlyOnceWith();
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

    expect(adapter.sendMessage).toHaveBeenCalledExactlyOnceWith(sendPayload);
    expect(adapter.editMessage).toHaveBeenCalledExactlyOnceWith(editPayload);
    expect(adapter.deleteMessage).toHaveBeenCalledExactlyOnceWith(deletePayload);
    expect(adapter.readMessage).toHaveBeenCalledExactlyOnceWith(readPayload);
    expect(adapter.startTyping).toHaveBeenCalledExactlyOnceWith(typingPayload);
  });

  it("делегирует event subscriptions в WS adapter", () => {
    repository.onMessage().subscribe();
    repository.onEditMessage().subscribe();
    repository.onDeleteMessage().subscribe();
    repository.onReadMessage().subscribe();
    repository.onTyping().subscribe();
    repository.onSetOnline().subscribe();
    repository.onSetOffline().subscribe();

    expect(adapter.onMessage).toHaveBeenCalledExactlyOnceWith();
    expect(adapter.onEditMessage).toHaveBeenCalledExactlyOnceWith();
    expect(adapter.onDeleteMessage).toHaveBeenCalledExactlyOnceWith();
    expect(adapter.onReadMessage).toHaveBeenCalledExactlyOnceWith();
    expect(adapter.onTyping).toHaveBeenCalledExactlyOnceWith();
    expect(adapter.onSetOnline).toHaveBeenCalledExactlyOnceWith();
    expect(adapter.onSetOffline).toHaveBeenCalledExactlyOnceWith();
  });
});
