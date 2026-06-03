/** @format */

import { Meta, StoryObj, applicationConfig } from "@storybook/angular";
import { of } from "rxjs";
import { FileService } from "@core/lib/services/file/file.service";
import { FileItemComponent } from "./file-item.component";

class MockFileService {
  uploadFile = () => of({ url: "https://example.com/mock-file.pdf" });
  deleteFile = () => of({ success: true as const });
}

const meta: Meta<FileItemComponent> = {
  title: "UI/PRIMITIVES/FileItem",
  component: FileItemComponent,
  tags: ["autodocs"],
  decorators: [
    applicationConfig({
      providers: [{ provide: FileService, useClass: MockFileService }],
    }),
  ],
  argTypes: {
    type: { control: "text" },
    name: { control: "text" },
    size: { control: "number" },
    mode: { control: "inline-radio", options: ["default", "preview"] },
    canDelete: { control: "boolean" },
  },
  render: (args) => ({
    props: args,
    template: `
      <div style="max-width: 400px;">
        <app-file-item
          [type]="type"
          [name]="name"
          [size]="size"
          [mode]="mode"
          [canDelete]="canDelete"
        ></app-file-item>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<FileItemComponent>;

export const Default: Story = {
  args: {
    type: "pdf",
    name: "Документ.pdf",
    size: 2457600,
    mode: "default",
    canDelete: false,
  },
};

export const WithDelete: Story = {
  args: {
    type: "pdf",
    name: "Удаляемый.pdf",
    size: 1048576,
    mode: "default",
    canDelete: true,
  },
};

export const Preview: Story = {
  args: {
    type: "image",
    name: "Фото.jpg",
    size: 3145728,
    mode: "preview",
    canDelete: true,
  },
};

export const SmallFile: Story = {
  args: {
    type: "txt",
    name: "readme.txt",
    size: 2048,
    mode: "default",
    canDelete: false,
  },
};
