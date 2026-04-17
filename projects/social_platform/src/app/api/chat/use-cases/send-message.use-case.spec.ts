/** @format */

import { TestBed } from "@angular/core/testing";
import { SendMessageUseCase } from "./send-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { SendChatMessageDto } from "@domain/chat/chat.model";

describe("SendMessageUseCase", () => {
  let useCase: SendMessageUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;

  function setup(): void {
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["sendMessage"]);
    TestBed.configureTestingModule({
      providers: [SendMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(SendMessageUseCase);
  }

  it("делегирует dto в chatRealtime.sendMessage", () => {
    setup();
    const dto: SendChatMessageDto = {
      chatType: "project",
      chatId: "1",
      text: "hello",
      fileUrls: [],
      replyTo: null,
    };

    useCase.execute(dto);

    expect(rt.sendMessage).toHaveBeenCalledOnceWith(dto);
  });
});
