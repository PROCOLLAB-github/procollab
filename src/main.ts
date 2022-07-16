/** @format */

import { enableProdMode } from "@angular/core";
import { platformBrowserDynamic } from "@angular/platform-browser-dynamic";

import { AppModule } from "./app/app.module";
import { environment } from "./environments/environment";
import * as Sentry from "@sentry/angular";
import { BrowserTracing } from "@sentry/tracing";

if (environment.production) {
  enableProdMode();

  Sentry.init({
    dsn: environment.sentryDns,
    integrations: [
      new BrowserTracing({
        tracingOrigins: ["localhost", "https://yourserver.io/api"], // TODO: pass no-mock api
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });
}

platformBrowserDynamic()
  .bootstrapModule(AppModule)
  .catch(err => console.error(err));
