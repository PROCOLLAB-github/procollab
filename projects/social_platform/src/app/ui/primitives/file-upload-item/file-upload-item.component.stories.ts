/** @format */

import { Meta, StoryObj } from "@storybook/angular";
import { FileUploadItemComponent } from "./file-upload-item.component";

const meta: Meta<FileUploadItemComponent> = {
  title: "UI/PRIMITIVES/FileUploadItem",
  component: FileUploadItemComponent,
  tags: ["autodocs"],
  argTypes: {
    type: { control: "text" },
    name: { control: "text" },
    size: { control: "number" },
    link: { control: "text" },
    loading: { control: "boolean" },
    error: { control: "text" },
  },
  render: args => ({
    props: {
      ...args,
      onDelete: () => console.log("[FileUploadItem] delete"),
      onRetry: () => console.log("[FileUploadItem] retry"),
    },
    template: `
      <div style="max-width: 400px;">
        <app-file-upload-item
          [type]="type"
          [name]="name"
          [size]="size"
          [link]="link"
          [loading]="loading"
          [error]="error"
          (delete)="onDelete()"
          (retry)="onRetry()"
        ></app-file-upload-item>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<FileUploadItemComponent>;

export const Default: Story = {
  args: {
    type: "pdf",
    name: "Документ.pdf",
    size: 2457600,
    link: "#",
    loading: false,
    error: "",
  },
};

export const Image: Story = {
  args: {
    type: "image",
    name: "Фото.jpg",
    size: 1048576,
    link: "#",
    loading: false,
    error: "",
  },
};

export const Doc: Story = {
  args: {
    type: "doc",
    name: "Отчёт.docx",
    size: 524288,
    link: "#",
    loading: false,
    error: "",
  },
};

export const Loading: Story = {
  args: {
    type: "pdf",
    name: "Загрузка.pdf",
    size: 0,
    link: "",
    loading: true,
    error: "",
  },
};

export const Error: Story = {
  args: {
    type: "file",
    name: "Ошибка.txt",
    size: 0,
    link: "",
    loading: false,
    error: "Не удалось загрузить файл",
  },
};
