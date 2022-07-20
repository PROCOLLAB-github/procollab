/** @format */

import { Meta, Story } from "@storybook/angular";
import { CheckboxComponent } from "./checkbox.component";

export default {
  title: "Checkbox",
  component: CheckboxComponent,
} as Meta;

const Template: Story = args => ({
  props: args,
});

export const Empty = Template.bind({});
