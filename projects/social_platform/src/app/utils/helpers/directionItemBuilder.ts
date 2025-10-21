/** @format */

export interface DirectionItem {
  direction: string;
  icon: string;
  about: string;
  type: string;
}

export const directionItemBuilder = (
  amount: number,
  directions: string[],
  icons: string[],
  abouts: string[] | any[],
  types: string[]
) => {
  if (amount <= 0) return;

  return Array.from({ length: amount }, (_, i) => ({
    direction: directions[i],
    icon: icons[i],
    about: abouts[i],
    type: types[i],
  }));
};
