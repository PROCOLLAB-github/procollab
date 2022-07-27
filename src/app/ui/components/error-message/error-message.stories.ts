/** @format */

import { Meta, Story } from "@storybook/angular";
import { ErrorMessageComponent } from "./error-message.component";

export default {
  title: "Error",
  component: ErrorMessageComponent,
} as Meta;

const Template: Story = args => ({
  props: args,
  template: "<app-error-message>Ошибка</app-error-message>",
});

export const Basic = Template.bind({});
