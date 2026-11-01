#!/usr/bin/env bash
set -euo pipefail

# Запуск только зафиксированного кода PR с dev API. Секреты не читаются и не выводятся.
pr517_script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
pr517_repo="$(git -C "$pr517_script_dir" rev-parse --show-toplevel)"
pr517_expected="${1:-}"
if [[ ! "$pr517_expected" =~ ^[0-9a-f]{40}$ ]]; then
  echo "Передайте полный SHA проверяемого PR первым аргументом." >&2
  exit 2
fi
cd -- "$pr517_repo"
pr517_actual="$(git rev-parse HEAD)"
if [[ "$pr517_actual" != "$pr517_expected" ]]; then
  echo "HEAD отличается от переданного SHA. Запуск остановлен." >&2
  exit 3
fi
if ! git diff --quiet HEAD -- projects || [[ -n "$(git ls-files --others --exclude-standard -- projects)" ]]; then
  echo "Исходники приложения отличаются от commit. Запуск остановлен." >&2
  exit 4
fi
node <<'NODE'
const fs = require("node:fs");
const env = fs.readFileSync("projects/social_platform/src/environments/environment.ts", "utf8");
const config = JSON.parse(fs.readFileSync("angular.json", "utf8"));
const architect = config.projects.social_platform.architect;
if (!/production:\s*false/.test(env) || !/apiUrl:\s*"https:\/\/dev\.procollab\.ru"/.test(env) ||
    !/websocketUrl:\s*"wss:\/\/dev\.procollab\.ru\/ws"/.test(env) ||
    architect.serve.configurations.development.buildTarget !== "social_platform:build:development" ||
    architect.build.configurations.development.fileReplacements?.length) {
  throw new Error("Development-конфигурация не соответствует проверенному запуску с dev API.");
}
NODE
printf 'PR #517 commit: %s\n' "$pr517_actual"
printf 'Локально: http://127.0.0.1:4317/auth/login\nAPI: https://dev.procollab.ru\n'
exec env NG_BUILD_MAX_WORKERS="${NG_BUILD_MAX_WORKERS:-2}" \
  ./node_modules/.bin/ng serve social_platform --configuration=development \
  --host 127.0.0.1 --port 4317 --no-open
