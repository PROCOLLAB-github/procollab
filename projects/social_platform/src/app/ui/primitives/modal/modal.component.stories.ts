/** @format */

import { Meta, StoryObj, moduleMetadata, applicationConfig } from "@storybook/angular";
import { Overlay } from "@angular/cdk/overlay";
import { ModalComponent } from "./modal.component";

const meta: Meta<ModalComponent> = {
  title: "UI/PRIMITIVES/Modal",
  component: ModalComponent,
  tags: ["autodocs"],
  decorators: [
    applicationConfig({
      providers: [Overlay],
    }),
  ],
  argTypes: {
    color: { control: "inline-radio", options: ["primary", "gradient"] },
    open: { control: "boolean" },
  },
  render: (args) => ({
    props: {
      ...args,
      onClose: () => {},
    },
    template: `
      <div style="padding: 40px;">
        <app-modal [open]="open" [color]="color" [openChange]="onClose">
          <div style="padding: 24px; min-width: 300px;">
            <h3 style="margin: 0 0 12px;">Заголовок модалки</h3>
            <p style="margin: 0 0 16px; color: var(--dark-grey);">Контент модального окна</p>
            <button
              (click)="onClose()"
              style="padding: 8px 16px; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;"
            >Закрыть</button>
          </div>
        </app-modal>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<ModalComponent>;

export const Default: Story = {
  args: { open: true, color: "primary" },
};

export const Gradient: Story = {
  args: { open: true, color: "gradient" },
};

export const Closed: Story = {
  args: { open: false, color: "primary" },
};
