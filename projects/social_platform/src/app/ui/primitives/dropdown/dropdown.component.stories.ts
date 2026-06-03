/** @format */

import { Meta, StoryObj, moduleMetadata, applicationConfig } from "@storybook/angular";
import { OverlayModule } from "@angular/cdk/overlay";
import { ClickOutsideModule } from "ng-click-outside";
import { DropdownComponent } from "./dropdown.component";

const sampleOptions = [
  { id: 1, label: "Вариант один", value: "one" },
  { id: 2, label: "Вариант два", value: "two" },
  { id: 3, label: "Вариант три", value: "three" },
  { id: 4, label: "Очень длинный вариант для проверки переполнения", value: "four" },
];

const meta: Meta<DropdownComponent> = {
  title: "UI/PRIMITIVES/Dropdown",
  component: DropdownComponent,
  tags: ["autodocs"],
  decorators: [
    applicationConfig({
      providers: [],
    }),
    moduleMetadata({
      imports: [OverlayModule, ClickOutsideModule],
    }),
  ],
  argTypes: {
    type: { control: "select", options: ["text", "icons", "avatars", "shapes", "tags", "goals"] },
    isOpen: { control: "boolean" },
    highlightedIndex: { control: "number" },
    colorText: { control: "inline-radio", options: ["grey", "red"] },
  },
  render: (args) => ({
    props: { ...args, options: sampleOptions },
    template: `
      <div style="padding: 80px 20px;">
        <app-dropdown
          [options]="options"
          [type]="type"
          [isOpen]="isOpen"
          [highlightedIndex]="highlightedIndex"
          [colorText]="colorText"
        >
          <button style="padding: 8px 16px; border: 1px solid #ccc; border-radius: 8px; cursor: pointer;">
            Открыть дропдаун
          </button>
        </app-dropdown>
      </div>
    `,
  }),
};
export default meta;

type Story = StoryObj<DropdownComponent>;

export const Default: Story = {
  args: { type: "text", isOpen: true, highlightedIndex: -1, colorText: "grey" },
};

export const Highlighted: Story = {
  args: { type: "text", isOpen: true, highlightedIndex: 1, colorText: "grey" },
};

export const RedText: Story = {
  args: { type: "text", isOpen: true, colorText: "red" },
};

export const Closed: Story = {
  args: { type: "text", isOpen: false, colorText: "grey" },
};
