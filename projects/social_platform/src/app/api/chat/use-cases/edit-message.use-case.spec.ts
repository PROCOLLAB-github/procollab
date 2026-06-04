/** @format */

import { TestBed } from "@angular/core/testing";
import { EditMessageUseCase } from "./edit-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { EditChatMessageDto } from "@domain/chat/chat.model";

describe("EditMessageUseCase", () => {
  let useCase: EditMessageUseCase;
  let rt: any;

  function setup(): void {
    rt = { editMessage: vi.fn() };
    TestBed.configureTestingModule({
      providers: [EditMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(EditMessageUseCase);
  }

  it("делегирует dto в chatRealtime.editMessage", () => {
    setup();
    const dto: EditChatMessageDto = {
      chatType: "project",
      chatId: "2",
      messageId: 1,
      text: "edited",
    };

    useCase.execute(dto);

    expect(rt.editMessage).toHaveBeenCalledExactlyOnceWith(dto);
  });
});
