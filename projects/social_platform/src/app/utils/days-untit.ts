/** @format */

export const daysUntil = (tommorowDate: Date) => {
  const todayDate = new Date();

  const difference = tommorowDate.getTime() - todayDate.getTime();

  const dayInMs = 1000 * 60 * 60 * 24;

  if (difference <= 0) return 0;

  return Math.ceil(difference / dayInMs);
};
