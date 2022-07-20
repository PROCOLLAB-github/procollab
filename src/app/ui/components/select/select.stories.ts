/** @format */

import { Meta, Story } from "@storybook/angular";
import { SelectComponent } from "./select.component";

export default {
  title: "Select",
  component: SelectComponent,
} as Meta;

const Template: Story = args => ({ props: args });

export const Basic = Template.bind({});
Basic.args = {
  ...Basic.args,
  options: [{ id: 1, value: "343", label: "3434" }],
};
