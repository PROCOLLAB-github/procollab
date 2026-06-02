/** @format */

// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  sentryDns: "https://fc61f416df6044bab8c7e1afd55f4355@o1186023.ingest.sentry.io/6577563",
  apiUrl: "https://dev.procollab.ru", // TODO: change it before merge
  skillsApiUrl: "https://skills.dev.procollab.ru",
  // analytics
  analyticsHost: "app.procollab.ru",
  yandexMetrikaId: 91871365,
  mailRuCounterId: "3622531",
  mailRuRegisterId: "3543687",
  registerPath: "/auth/register",
  // websockets
  websocketUrl: "wss://dev.procollab.ru/ws", // TODO: change it before merge
  websocketReconnectionInterval: 500,
  websocketReconnectionMaxAttempts: 5,
};
