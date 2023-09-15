/** @format */

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
