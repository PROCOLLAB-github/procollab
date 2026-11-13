/** @format */
export const environment = {
  production: true,
  buildProfile: "white-label-pilot-v1",
  instanceMode: true,
  cookiePrefix: "pilot_",
  apiUrl: "/backend",
  skillsApiUrl: "/backend",
  websocketUrl: `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}/ws`,
  websocketReconnectionInterval: 5000,
  websocketReconnectionMaxAttempts: 5,
  sentryDns: "",
  analyticsHost: "",
  yandexMetrikaId: 0,
  mailRuCounterId: "",
  mailRuRegisterId: "",
  registerPath: "/auth/register",
};
