/** @format */

export interface ApiPagination<T> {
  count: number;
  results: T[];
  next: string;
  previous: string;
}
