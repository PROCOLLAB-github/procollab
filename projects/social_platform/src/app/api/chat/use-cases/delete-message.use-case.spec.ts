/** @format */

import { TestBed } from "@angular/core/testing";
import { DeleteMessageUseCase } from "./delete-message.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { DeleteChatMessageDto } from "@domain/chat/chat.model";

describe("DeleteMessageUseCase", () => {
  let useCase: DeleteMessageUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;

  function setup(): void {
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["deleteMessage"]);
    TestBed.configureTestingModule({
      providers: [DeleteMessageUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(DeleteMessageUseCase);
  }

  it("делегирует dto в chatRealtime.deleteMessage", () => {
    setup();
    const dto: DeleteChatMessageDto = { chatType: "project", chatId: "2", messageId: 1 };

    useCase.execute(dto);

    expect(rt.deleteMessage).toHaveBeenCalledOnceWith(dto);
  });
});
