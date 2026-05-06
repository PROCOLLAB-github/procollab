/** @format */

import { LocalStorageSeenModulesAdapter } from "./local-storage-seen-modules.adapter";

describe("LocalStorageSeenModulesAdapter", () => {
  let adapter: LocalStorageSeenModulesAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageSeenModulesAdapter();
  });

  afterEach(() => localStorage.clear());

  it("markSeen записывает ключ вида course_{c}_module_{m}_complete_seen=true", () => {
    adapter.markSeen(1, 2);

    expect(localStorage.getItem("course_1_module_2_complete_seen")).toBe("true");
  });

  it("isSeen возвращает false пока не помечено", () => {
    expect(adapter.isSeen(1, 2)).toBeFalse();
  });

  it("isSeen возвращает true после markSeen", () => {
    adapter.markSeen(1, 2);

    expect(adapter.isSeen(1, 2)).toBeTrue();
  });

  it("разные пары (courseId, moduleId) изолированы", () => {
    adapter.markSeen(1, 2);

    expect(adapter.isSeen(1, 2)).toBeTrue();
    expect(adapter.isSeen(1, 3)).toBeFalse();
    expect(adapter.isSeen(2, 2)).toBeFalse();
  });
});
