/** @format */

import { throwError, timer } from "rxjs";

export const exponentialBackoff = (maxAttempts: number) => {
  const RETRY_DELAY = 1000;

  return {
    count: maxAttempts,
    delay: (error: any, retryCount: number) => {
      if (error.status >= 400 && error.status < 500) {
        return throwError(() => error);
      }
      const exponentialTimer = Math.pow(2, retryCount) * RETRY_DELAY;
      return timer(exponentialTimer);
    },
  };
};
