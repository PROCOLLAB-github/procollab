/** @format */

import { Meta, Story } from "@storybook/angular";
import { InputComponent } from "./input.component";

export default {
  title: "Input",
  component: InputComponent
} as Meta;

const Template: Story = args => ({
  props: args
});

export const Basic = Template.bind({});
