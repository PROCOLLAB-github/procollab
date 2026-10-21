/** @format */
import { canLeaveManagement } from "./management-leave.guard";

describe("Уход из управления программой", () => {
  it("разрешает auth-redirect до создания страницы", () => {
    expect(canLeaveManagement(null)).toBe(true);
  });
  it.each([true, false])("сохраняет решение существующей формы: %s", async decision => {
    const component = { canLeave: vi.fn().mockResolvedValue(decision) };
    expect(await canLeaveManagement(component)).toBe(decision);
    expect(component.canLeave).toHaveBeenCalledOnce();
  });
});
