/** @format */

import { TestBed } from "@angular/core/testing";
import { of } from "rxjs";
import { WebsocketService } from "@core/lib/services/websockets/websocket.service";
import { TokenService } from "@corelib";
import { ChatWsAdapter } from "./chat-ws.adapter";
import {
  ChatEventType,
  DeleteChatMessageDto,
  EditChatMessageDto,
  OnChangeStatus,
  OnChatMessageDto,
  OnDeleteChatMessageDto,
  OnEditChatMessageDto,
  OnReadChatMessageDto,
  ReadChatMessageDto,
  SendChatMessageDto,
  TypingInChatDto,
  TypingInChatEventDto,
} from "@domain/chat/chat.model";

describe("ChatWsAdapter", () => {
  let adapter: ChatWsAdapter;
  let ws: jasmine.SpyObj<WebsocketService>;
  let tokens: jasmine.SpyObj<TokenService>;

  function setup(): void {
    ws = jasmine.createSpyObj<WebsocketService>("WebsocketService", ["connect", "send", "on"]);
    tokens = jasmine.createSpyObj<TokenService>("TokenService", ["getTokens"]);
    TestBed.configureTestingModule({
      providers: [
        ChatWsAdapter,
        { provide: WebsocketService, useValue: ws },
        { provide: TokenService, useValue: tokens },
      ],
    });
    adapter = TestBed.inject(ChatWsAdapter);
  }

  it("connect подключается к /chat/ если токен есть", () => {
    setup();
    tokens.getTokens.and.returnValue({ access: "a", refresh: "r" });
    ws.connect.and.returnValue(of(undefined));

    adapter.connect().subscribe();

    expect(ws.connect).toHaveBeenCalledOnceWith("/chat/");
  });

  it("connect кидает если токена нет", () => {
    setup();
    tokens.getTokens.and.returnValue(null);

    expect(() => adapter.connect()).toThrowError("No token provided");
  });

  it("sendMessage шлёт NEW_MESSAGE", () => {
    setup();
    const msg = {} as SendChatMessageDto;

    adapter.sendMessage(msg);

    expect(ws.send).toHaveBeenCalledOnceWith(ChatEventType.NEW_MESSAGE, msg);
  });

  it("editMessage шлёт EDIT_MESSAGE", () => {
    setup();
    const msg = {} as EditChatMessageDto;

    adapter.editMessage(msg);

    expect(ws.send).toHaveBeenCalledOnceWith(ChatEventType.EDIT_MESSAGE, msg);
  });

  it("deleteMessage шлёт DELETE_MESSAGE", () => {
    setup();
    const msg = {} as DeleteChatMessageDto;

    adapter.deleteMessage(msg);

    expect(ws.send).toHaveBeenCalledOnceWith(ChatEventType.DELETE_MESSAGE, msg);
  });

  it("readMessage шлёт READ_MESSAGE", () => {
    setup();
    const msg = {} as ReadChatMessageDto;

    adapter.readMessage(msg);

    expect(ws.send).toHaveBeenCalledOnceWith(ChatEventType.READ_MESSAGE, msg);
  });

  it("startTyping шлёт TYPING", () => {
    setup();
    const typing = {} as TypingInChatDto;

    adapter.startTyping(typing);

    expect(ws.send).toHaveBeenCalledOnceWith(ChatEventType.TYPING, typing);
  });

  it("onMessage слушает NEW_MESSAGE", () => {
    setup();
    ws.on.and.returnValue(of({} as OnChatMessageDto));

    adapter.onMessage().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.NEW_MESSAGE);
  });

  it("onEditMessage слушает EDIT_MESSAGE", () => {
    setup();
    ws.on.and.returnValue(of({} as OnEditChatMessageDto));

    adapter.onEditMessage().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.EDIT_MESSAGE);
  });

  it("onDeleteMessage слушает DELETE_MESSAGE", () => {
    setup();
    ws.on.and.returnValue(of({} as OnDeleteChatMessageDto));

    adapter.onDeleteMessage().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.DELETE_MESSAGE);
  });

  it("onReadMessage слушает READ_MESSAGE", () => {
    setup();
    ws.on.and.returnValue(of({} as OnReadChatMessageDto));

    adapter.onReadMessage().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.READ_MESSAGE);
  });

  it("onTyping слушает TYPING", () => {
    setup();
    ws.on.and.returnValue(of({} as TypingInChatEventDto));

    adapter.onTyping().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.TYPING);
  });

  it("onSetOnline слушает SET_ONLINE", () => {
    setup();
    ws.on.and.returnValue(of({} as OnChangeStatus));

    adapter.onSetOnline().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.SET_ONLINE);
  });

  it("onSetOffline слушает SET_OFFLINE", () => {
    setup();
    ws.on.and.returnValue(of({} as OnChangeStatus));

    adapter.onSetOffline().subscribe();

    expect(ws.on).toHaveBeenCalledOnceWith(ChatEventType.SET_OFFLINE);
  });
});
