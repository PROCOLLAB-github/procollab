/** @format */

import { Meta, Story } from "@storybook/angular";
import { ButtonComponent } from "@ui/components";

export default {
  title: "Button",
  component: ButtonComponent,
} as Meta;

export const PrimaryMd: Story = () => ({
  template: "<app-button size='md'>click</app-button>"
});

export const PrimaryLg: Story = () => ({
  template: "<app-button size='lg'>click</app-button>"
});

// export const Primary: Story = () => ({
//   props: {},
//   template: "<app-button>click!</app-button>",
// });
