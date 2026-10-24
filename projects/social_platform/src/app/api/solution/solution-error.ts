/** @format */

import { HttpErrorResponse } from "@angular/common/http";
import camelcaseKeys from "camelcase-keys";
import { SolutionApiError, SolutionIssue } from "@domain/solution/solution-contract.model";

export function solutionError(error: unknown): SolutionApiError {
  if (error instanceof RangeError)
    return { code: "invalid_id", detail: "Некорректный адрес решения.", errors: [], meta: {} };
  if (error instanceof HttpErrorResponse) {
    const body = error.error as Record<string, unknown> | null;
    if (
      body &&
      typeof body === "object" &&
      typeof body["code"] === "string" &&
      typeof body["detail"] === "string"
    ) {
      const errors: SolutionIssue[] = Array.isArray(body["errors"])
        ? body["errors"].flatMap(item => {
            if (!item || typeof item !== "object") return [];
            const row = item as Record<string, unknown>;
            if (
              typeof row["path"] !== "string" ||
              typeof row["code"] !== "string" ||
              typeof row["detail"] !== "string"
            )
              return [];
            return [
              {
                path: row["path"],
                code: row["code"],
                detail: row["detail"],
                fieldId: typeof row["field_id"] === "number" ? row["field_id"] : null,
                ...(typeof row["criterion_id"] === "number" &&
                Number.isSafeInteger(row["criterion_id"])
                  ? { criterionId: row["criterion_id"] }
                  : {}),
              },
            ];
          })
        : [];
      return {
        code: body["code"],
        detail: body["detail"],
        errors,
        meta:
          body["meta"] && typeof body["meta"] === "object" && !Array.isArray(body["meta"])
            ? camelcaseKeys(body["meta"] as Record<string, unknown>, { deep: true })
            : {},
      };
    }
    const code =
      error.status === 0
        ? "network"
        : error.status === 401
          ? "unauthorized"
          : error.status === 403
            ? "forbidden"
            : error.status === 404
              ? "not_found"
              : "server_error";
    const detail =
      code === "unauthorized"
        ? "Войдите в аккаунт снова."
        : code === "forbidden"
          ? "Нет доступа к решению."
          : code === "not_found"
            ? "Решение не найдено."
            : "Не удалось загрузить решение. Попробуйте еще раз.";
    return { code, detail, errors: [], meta: {} };
  }
  return {
    code: "unknown",
    detail: "Не удалось выполнить действие. Попробуйте еще раз.",
    errors: [],
    meta: {},
  };
}
