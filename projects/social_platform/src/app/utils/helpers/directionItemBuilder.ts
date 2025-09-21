/** @format */

export interface DirectionItem {
  direction: string;
  icon: string;
  about: string;
}

export const directionItemBuilder = (
  amount: number,
  directions: string[],
  icons: string[],
  abouts: string[]
) => {
  if (amount <= 0) return;

  return Array.from({ length: amount }, (_, i) => ({
    direction: directions[i],
    icon: icons[i],
    about: abouts[i],
  }));
};
