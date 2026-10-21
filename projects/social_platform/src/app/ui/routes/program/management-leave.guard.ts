/** @format */

/** Ранний auth-redirect может отменить активацию до создания компонента. */
export function canLeaveManagement(component: { canLeave(): Promise<boolean> } | null) {
  return component?.canLeave() ?? true;
}
