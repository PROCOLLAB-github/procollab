/** @format */

import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { TransientNoticeComponent } from "./transient-notice.component";

@Component({
  imports: [TransientNoticeComponent],
  template: `
    @if (message()) {
      <app-transient-notice [source]="message" (dismissed)="message.set(null)">
        {{ message() }}
      </app-transient-notice>
    }
    @if (saved()) {
      <app-transient-notice [source]="saved" (dismissed)="saved.set(false)">
        Изменения сохранены.
      </app-transient-notice>
    }
  `,
})
class NoticeHost {
  readonly message = signal<string | null>(null, { equal: () => false });
  readonly saved = signal(false, { equal: () => false });
}

describe("Подтверждение действия", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  function setup() {
    const fixture = TestBed.createComponent(NoticeHost);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const notices = () => fixture.nativeElement.querySelectorAll("app-transient-notice");
    const advance = (ms: number) => {
      vi.advanceTimersByTime(ms);
      fixture.detectChanges();
    };
    return { fixture, host, notices, advance };
  }

  it("показывает результат как status и закрывает его ровно через 2 секунды", () => {
    const { fixture, host, notices, advance } = setup();
    host.message.set("Кейс проекта изменен.");
    fixture.detectChanges();
    expect(notices()).toHaveLength(1);
    expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain(
      "Кейс проекта изменен.",
    );
    advance(1999);
    expect(notices()).toHaveLength(1);
    advance(1);
    expect(host.message()).toBeNull();
    expect(notices()).toHaveLength(0);
  });

  it("крестик закрывает только свое сообщение и отменяет его таймер", () => {
    const { fixture, host, notices, advance } = setup();
    host.message.set("Кейс проекта изменен.");
    host.saved.set(true);
    fixture.detectChanges();
    const close = notices()[0].querySelector("button") as HTMLButtonElement;
    expect(close.type).toBe("button");
    expect(close.getAttribute("aria-label")).toBe("Закрыть уведомление");
    close.click();
    fixture.detectChanges();
    expect(host.message()).toBeNull();
    expect(host.saved()).toBe(true);
    expect(notices()).toHaveLength(1);
    advance(2000);
    expect(host.saved()).toBe(false);
  });

  it.each(["Новое подтверждение.", "Кейс проекта изменен."])(
    "дает полные 2 секунды повторному результату: %s",
    next => {
      const { fixture, host, notices, advance } = setup();
      host.message.set("Кейс проекта изменен.");
      fixture.detectChanges();
      advance(1500);
      host.message.set(next);
      fixture.detectChanges();
      advance(500);
      expect(host.message()).toBe(next);
      expect(notices()).toHaveLength(1);
      advance(1499);
      expect(notices()).toHaveLength(1);
      advance(1);
      expect(notices()).toHaveLength(0);
    },
  );

  it("новое сообщение после крестика не закрывается старым таймером", () => {
    const { fixture, host, notices, advance } = setup();
    host.saved.set(true);
    fixture.detectChanges();
    advance(1000);
    notices()[0].querySelector("button").click();
    fixture.detectChanges();
    advance(500);
    host.saved.set(true);
    fixture.detectChanges();
    advance(1000);
    expect(host.saved()).toBe(true);
    advance(1000);
    expect(host.saved()).toBe(false);
  });

  it("при уходе со страницы отменяет таймер без изменения состояния", () => {
    const { fixture, host, advance } = setup();
    host.message.set("Сохранено.");
    fixture.detectChanges();
    advance(500);
    fixture.destroy();
    vi.advanceTimersByTime(2000);
    expect(host.message()).toBe("Сохранено.");
  });
});
