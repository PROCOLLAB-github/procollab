/** @format */

/** Возвращаем только внутренние защищенные страницы, сохраняя query и fragment. */
export function authReturnUrl(value: unknown): string | null {
  return typeof value === "string" &&
    /^\/office(?:\/|[?#]|$)/.test(value) &&
    // eslint-disable-next-line no-control-regex -- Управляющие символы запрещены в маршруте возврата.
    !/[\\\u0000-\u001f\u007f]/.test(value)
    ? value
    : null;
}

export function authLoginUrl(returnUrl: unknown): string {
  const path = authReturnUrl(returnUrl);
  return path ? `/auth/login?returnUrl=${encodeURIComponent(path)}` : "/auth/login";
}
