/** @format */

import { Pipe, PipeTransform } from "@angular/core";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const RELATIVE_DAYS_LIMIT = 7;

/** Компактное время уведомления без сторонней date dependency. */
export function formatNotificationRelativeTime(value: string, now = Date.now()): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return "";

  const difference = Math.max(0, now - timestamp);
  if (difference < MINUTE) return "только что";
  if (difference < HOUR) return `${Math.floor(difference / MINUTE)} мин назад`;
  if (difference < DAY) return `${Math.floor(difference / HOUR)} ч назад`;
  if (difference < RELATIVE_DAYS_LIMIT * DAY) return `${Math.floor(difference / DAY)} д назад`;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(timestamp));
}

@Pipe({
  name: "notificationRelativeTime",
  standalone: true,
  pure: true,
})
export class NotificationRelativeTimePipe implements PipeTransform {
  transform(value: string): string {
    return formatNotificationRelativeTime(value);
  }
}
