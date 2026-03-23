/** @format */

export function animateContentHeight(elem: HTMLElement, updateContent: () => void): void {
  const startHeight = elem.getBoundingClientRect().height;

  updateContent();

  const endHeight = elem.getBoundingClientRect().height;

  if (Math.abs(startHeight - endHeight) < 1) return;

  elem.style.height = `${startHeight}px`;
  elem.style.overflow = "hidden";
  elem.style.transition = "height 280ms ease";

  requestAnimationFrame(() => {
    elem.style.height = `${endHeight}px`;
  });

  const clearStyles = () => {
    elem.style.height = "";
    elem.style.overflow = "";
    elem.style.transition = "";
    elem.removeEventListener("transitionend", clearStyles);
  };

  elem.addEventListener("transitionend", clearStyles);
}
