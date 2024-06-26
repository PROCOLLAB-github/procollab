/** @format */

import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class YtExtractService {
  transform(value: any): { extractedLink?: string; newText: string } {
    const youtubeRegex = /(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/gm;

    // Find matches in the text
    const match = youtubeRegex.exec(value);
    if (!match) {
      return { newText: value }; // No YouTube link found, return original text
    }

    // Extracted YouTube link
    const extractedLink = match[0];

    // Remove the YouTube link from the original text
    const newText = value.replace(extractedLink, "");

    // Generate the embedded YouTube link
    const videoIdRegex = /(?:v=|\/)([A-Za-z0-9_-]{11})/;
    const videoIdMatch = extractedLink.match(videoIdRegex);
    let embedLink = "";

    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      embedLink = `https://www.youtube.com/embed/${videoId}`;
    }

    return { extractedLink: embedLink, newText };
  }
}
