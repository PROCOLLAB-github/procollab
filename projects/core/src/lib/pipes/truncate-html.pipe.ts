/** @format */

import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";

@Pipe({ name: "truncateHtml", standalone: true })
export class TruncateHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, limit: number): SafeHtml {
    if (!value) return "";

    // Сначала убираем все HTML теги чтобы считать только текст
    const plainText = value.replace(/<[^>]*>/g, "");

    if (plainText.length <= limit) {
      return this.sanitizer.bypassSecurityTrustHtml(value);
    }

    // Обрезаем по тексту, сохраняя теги
    let charCount = 0;
    let result = "";
    let inTag = false;
    let currentTag = "";
    const openTags: string[] = [];
    const selfClosingTags = ["br", "hr", "img", "input", "meta", "link"];

    for (let i = 0; i < value.length; i++) {
      const char = value[i];

      if (char === "<") {
        inTag = true;
        currentTag = "";
      }

      if (inTag) {
        result += char;
        currentTag += char;

        if (char === ">") {
          // Закончился тег, анализируем его
          const tagContent = currentTag.slice(1, -1).trim(); // убираем < и >

          if (tagContent.startsWith("/")) {
            // Закрывающий тег
            openTags.pop();
          } else if (!tagContent.startsWith("!")) {
            // Открывающий тег (не комментарий)
            const tagNameMatch = tagContent.match(/^(\w+)/i);
            if (tagNameMatch) {
              const tagName = tagNameMatch[1].toLowerCase();
              // Проверяем, что это не самозакрывающийся тег
              if (!selfClosingTags.includes(tagName) && !tagContent.endsWith("/")) {
                openTags.push(tagName);
              }
            }
          }

          inTag = false;
          currentTag = "";
        }
      } else {
        if (charCount >= limit) break;
        result += char;
        charCount++;
      }
    }

    // Закрываем все открытые теги
    let closedTags = result;
    for (let i = openTags.length - 1; i >= 0; i--) {
      closedTags += `</${openTags[i]}>`;
    }

    return this.sanitizer.bypassSecurityTrustHtml(closedTags + "...");
  }
}
