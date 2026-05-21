/** @format */

export interface DirectionItem<TAbout = any> {
  direction: string;
  icon: string;
  about: TAbout;
  type: string;
}

export const directionItemBuilder = <TAbout>(
  amount: number,
  directions: string[],
  icons: string[],
  abouts: TAbout[],
  types: string[]
): DirectionItem<TAbout>[] | undefined => {
  if (amount <= 0) return;

  return Array.from({ length: amount }, (_, i) => ({
    direction: directions[i],
    icon: icons[i],
    about: abouts[i],
    type: types[i],
  }));
};
