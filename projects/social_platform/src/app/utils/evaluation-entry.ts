/**
 * Пилот разрешает начать экспертный путь со страницы программы и ее материалов.
 * Наличие роли проверяет вызывающая оболочка; права на объекты остаются на API.
 *
 * @format
 */

export function isEvaluationEntry(url: string, pilot: boolean): boolean {
  if (/^\/office\/evaluation(?:[/?#]|$)/.test(url)) return true;
  if (
    /^\/office\/program\/\d+\/(?:projects-rating|solutions-rating|solutions\/\d+\/evaluation)(?:[/?#]|$)/.test(
      url,
    )
  ) {
    return true;
  }
  return (
    pilot &&
    (/^\/office\/program(?:[/?#]|$)/.test(url) || /^\/office\/projects\/\d+(?:[/?#]|$)/.test(url))
  );
}
