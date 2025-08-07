/**
 * Эта функция реализует анимированное разворачивание или сворачивание HTML элемента
 * с использованием CSS-переходов.
 *
 *
 * Принцип работы:
 * 1. Запоминает начальную высоту элемента
 * 2. Добавляет или удаляет класс расширения в зависимости от текущего состояния
 * 3. Измеряет новую высоту после изменения класса
 * 4. Устанавливает начальную высоту и запускает анимацию перехода к новой высоте
 * 5. После завершения анимации удаляет явно заданную высоту, чтобы элемент мог
 *    дальше изменяться естественным образом
 *
 * @format
 * @fileoverview Функция для плавного разворачивания/сворачивания HTML элемента
 * @param {HTMLElement} elem - HTML элемент, который нужно развернуть/свернуть
 * @param {string} expandedClass - CSS класс, который добавляется/удаляется для изменения состояния
 * @param {boolean} isExpanded - Текущее состояние элемента (true - развернут, false - свернут)
 */

export function expandElement(elem: HTMLElement, expandedClass: string, isExpanded: boolean) {
  const startHeight = window.getComputedStyle(elem).height;

  if (!isExpanded) {
    elem.classList.add(expandedClass);
  } else {
    elem.classList.remove(expandedClass);
  }

  const height = window.getComputedStyle(elem).height;

  elem.style.height = startHeight;

  requestAnimationFrame(() => {
    elem.style.transition = "";

    requestAnimationFrame(() => {
      elem.style.height = height;
    });
  });

  function clearHeight() {
    elem.style.height = "";
    elem.removeEventListener("transitioned", clearHeight);
  }

  elem.addEventListener("transitionend", clearHeight);
}
