/** @format */

// Sample the rendered text colors of the redesigned components, including their backgrounds.
module.exports = async function contrast(page) {
  return page.evaluate(() => {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const rgba = color => {
      context.clearRect(0, 0, 1, 1);
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);
      return [...context.getImageData(0, 0, 1, 1).data].map((v, i) => (i === 3 ? v / 255 : v));
    };
    const over = (front, back) =>
      front.slice(0, 3).map((v, i) => v * front[3] + back[i] * (1 - front[3]));
    const background = el => {
      if (!el) return [255, 255, 255];
      const color = rgba(getComputedStyle(el).backgroundColor);
      return color[3] === 1 ? color.slice(0, 3) : over(color, background(el.parentElement));
    };
    const luminance = color =>
      color
        .map(v => {
          const s = v / 255;
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
        })
        .reduce((sum, value, i) => sum + value * [0.2126, 0.7152, 0.0722][i], 0);
    const roots =
      "app-vacancy-card,app-project-vacancy-card,.detail__header,app-vacancies-left-side,app-vacancies-right-side,app-vacancy-responses,app-response-card,app-vacancy-created-dialog";
    const selectors =
      ".status,.tag,.letter,h1,h2,h3,.vacancy__date,.vacancy__specialization,.skills__empty,.skills__toggle,.response__date,.conditions dt,.conditions dd,.created p,.button:not(:disabled)";
    const dialog = document.querySelector("[role=dialog]");
    const visibleRoots = [...document.querySelectorAll(roots)].filter(
      root => !dialog || dialog.contains(root),
    );
    return [...new Set(visibleRoots.flatMap(root => [...root.querySelectorAll(selectors)]))]
      .filter(el => el.getBoundingClientRect().height && el.textContent.trim())
      .map(el => {
        const bg = background(el);
        const fg = over(rgba(getComputedStyle(el).color), bg);
        const a = luminance(fg),
          b = luminance(bg);
        return {
          text: el.textContent.trim().slice(0, 60),
          foreground: fg,
          background: bg,
          ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        };
      });
  });
};
