/** @format */

import { TestBed } from "@angular/core/testing";
import { ReadMessageUseCase } from "./read-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { ReadChatMessageDto } from "@domain/chat/chat.model";

describe("ReadMessageUseCase", () => {
  let useCase: ReadMessageUseCase;
  let rt: any;

  function setup(): void {
    rt = { readMessage: vi.fn() };
    TestBed.configureTestingModule({
      providers: [ReadMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ReadMessageUseCase);
  }

  it("делегирует dto в chatRealtime.readMessage", () => {
    setup();
    const dto: ReadChatMessageDto = { chatType: "project", chatId: "2", messageId: 1 };

    useCase.execute(dto);

    expect(rt.readMessage).toHaveBeenCalledExactlyOnceWith(dto);
  });
});
