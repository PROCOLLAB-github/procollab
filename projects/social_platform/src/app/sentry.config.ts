/** @format */

import { init } from "@sentry/angular";
import { environment } from "@environment";

export function initSentry(): void {
  if (!environment.production || !environment.sentryDns) return;

  init({
    dsn: environment.sentryDns,
    environment: environment.production ? "production" : "development",
    integrations: [],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
  });
}
