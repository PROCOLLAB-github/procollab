/** @format */

import { Meta, StoryObj, moduleMetadata, applicationConfig } from "@storybook/angular";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { of } from "rxjs";
import { FileService } from "@core/lib/services/file/file.service";
import { UploadFileComponent } from "./upload-file.component";

class MockFileService {
  uploadFile = () => of({ url: "https://example.com/mock-file.pdf" });
  deleteFile = () => of({ success: true as const });
}

const meta: Meta<UploadFileComponent> = {
  title: "UI/PRIMITIVES/UploadFile",
  component: UploadFileComponent,
  tags: ["autodocs"],
  decorators: [
    applicationConfig({
      providers: [{ provide: FileService, useClass: MockFileService }],
    }),
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    accept: { control: "text" },
    error: { control: "boolean" },
    resetAfterUpload: { control: "boolean" },
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(""),
    },
    template: `
      <div style="max-width: 400px;">
        <app-upload-file
          [formControl]="control"
          [accept]="accept"
          [error]="error"
          [resetAfterUpload]="resetAfterUpload"
        >
          <div emptyPlaceholder style="padding: 24px; border: 2px dashed var(--medium-grey-for-outline); border-radius: 12px; cursor: pointer;">
            <p style="margin: 0; color: var(--dark-grey);">Нажмите или перетащите файл</p>
          </div>
        </app-upload-file>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<UploadFileComponent>;

export const Default: Story = {
  args: { accept: "", error: false, resetAfterUpload: false },
};

export const WithAccept: Story = {
  args: { accept: "image/*,.pdf", error: false, resetAfterUpload: false },
};

export const WithError: Story = {
  args: { accept: "", error: true, resetAfterUpload: false },
};

export const ResetAfterUpload: Story = {
  args: { accept: "", error: false, resetAfterUpload: true },
};
