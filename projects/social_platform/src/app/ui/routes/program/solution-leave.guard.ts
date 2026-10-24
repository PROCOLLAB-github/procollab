/** @format */

/** The router can cancel activation before creating the component. */
export function canLeaveSolution(component: { canLeave(): boolean } | null) {
  return component?.canLeave() ?? true;
}
