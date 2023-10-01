/** @format */

export class File {
  datetimeUploaded!: string;
  extension!: string;
  link!: string;
  mimeType!: string;
  name!: string;
  size!: number;
  user!: number;

  static default() {
    return {
      datetimeUploaded: "string",
      extension: "string",
      link: "string",
      mimeType: "string",
      name: "string",
      size: 1,
      user: 1,
    };
  }
}
