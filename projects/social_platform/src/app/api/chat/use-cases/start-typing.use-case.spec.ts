/** @format */

import { TestBed } from "@angular/core/testing";
import { StartTypingUseCase } from "./start-typing.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { TypingInChatDto } from "@domain/chat/chat.model";

describe("StartTypingUseCase", () => {
  let useCase: StartTypingUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;

  function setup(): void {
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["startTyping"]);
    TestBed.configureTestingModule({
      providers: [StartTypingUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(StartTypingUseCase);
  }

  it("делегирует dto в chatRealtime.startTyping", () => {
    setup();
    const dto: TypingInChatDto = { chatType: "project", chatId: "1" };

    useCase.execute(dto);

    expect(rt.startTyping).toHaveBeenCalledOnceWith(dto);
  });
});
