/** @format */

import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { TextareaComponent } from "./textarea.component";

const meta: Meta<TextareaComponent> = {
  title: "UI/PRIMITIVES/Textarea",
  component: TextareaComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    placeholder: { control: "text" },
    size: { control: "inline-radio", options: ["small", "big"] },
    error: { control: "boolean" },
    maxLength: { control: "number" },
  },
  render: args => ({
    props: {
      ...args,
      control: new FormControl(""),
    },
    template: `
      <div [style.maxWidth]="size === 'small' ? '400px' : '100%'">
        <app-textarea
          [formControl]="control"
          [placeholder]="placeholder"
          [size]="size"
          [error]="error"
          [maxLength]="maxLength"
        ></app-textarea>
      </div>`,
  }),
};
export default meta;

type Story = StoryObj<TextareaComponent>;

export const Default: Story = {
  args: { placeholder: "Введите сообщение...", size: "small" },
};

export const Big: Story = {
  args: { placeholder: "Большое поле", size: "big" },
};

export const WithError: Story = {
  args: { placeholder: "Ошибка", size: "small", error: true },
};

export const WithMaxLength: Story = {
  args: { placeholder: "Макс. 100 символов", size: "small", maxLength: 100 },
};

export const WithValue: Story = {
  args: { placeholder: "С текстом", size: "small" },
  render: args => ({
    props: {
      ...args,
      control: new FormControl("Пример текста\nВторая строка"),
    },
    template: `
      <div [style.maxWidth]="size === 'small' ? '400px' : '100%'">
        <app-textarea
          [formControl]="control"
          [placeholder]="placeholder"
          [size]="size"
        ></app-textarea>
      </div>`,
  }),
};
