/** @format */

import { TestBed } from "@angular/core/testing";
import { Subject } from "rxjs";
import { ObserveSetOnlineUseCase } from "./observe-set-online.use-case";
import { ChatRealtimePort } from "@domain/chat/ports/chat-realtime.port";
import { OnChangeStatus } from "@domain/chat/chat.model";

describe("ObserveSetOnlineUseCase", () => {
  let useCase: ObserveSetOnlineUseCase;
  let rt: jasmine.SpyObj<ChatRealtimePort>;
  let subject: Subject<OnChangeStatus>;

  function setup(): void {
    subject = new Subject();
    rt = jasmine.createSpyObj<ChatRealtimePort>("ChatRealtimePort", ["onSetOnline"]);
    rt.onSetOnline.and.returnValue(subject.asObservable());
    TestBed.configureTestingModule({
      providers: [ObserveSetOnlineUseCase, { provide: ChatRealtimePort, useValue: rt }],
    });
    useCase = TestBed.inject(ObserveSetOnlineUseCase);
  }

  it("делегирует в chatRealtime.onSetOnline", () => {
    setup();

    useCase.execute().subscribe();

    expect(rt.onSetOnline).toHaveBeenCalledOnceWith();
  });

  it("пробрасывает события из observable", done => {
    setup();
    const event: OnChangeStatus = { userId: 5 } as OnChangeStatus;

    useCase.execute().subscribe(e => {
      expect(e).toBe(event);
      done();
    });

    subject.next(event);
  });
});
