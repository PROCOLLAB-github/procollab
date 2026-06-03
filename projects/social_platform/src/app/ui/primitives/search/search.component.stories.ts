/** @format */

import { Meta, StoryObj, moduleMetadata } from "@storybook/angular";
import { ReactiveFormsModule, FormControl } from "@angular/forms";
import { SearchComponent } from "./search.component";

const meta: Meta<SearchComponent> = {
  title: "UI/PRIMITIVES/Search",
  component: SearchComponent,
  tags: ["autodocs"],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule],
    }),
  ],
  argTypes: {
    placeholder: { control: "text" },
    openable: { control: "boolean" },
    error: { control: "boolean" },
  },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl(""),
    },
    template: `<app-search
      [formControl]="control"
      [placeholder]="placeholder"
      [openable]="openable"
      [error]="error"
    ></app-search>`,
  }),
};
export default meta;

type Story = StoryObj<SearchComponent>;

export const Default: Story = {
  args: { placeholder: "Поиск...", openable: true },
};

export const AlwaysOpen: Story = {
  args: { placeholder: "Всегда открыт", openable: false },
};

export const WithError: Story = {
  args: { placeholder: "Ошибка", openable: true, error: true },
};

export const WithValue: Story = {
  args: { placeholder: "Поиск", openable: true },
  render: (args) => ({
    props: {
      ...args,
      control: new FormControl("запрос"),
    },
    template: `<app-search
      [formControl]="control"
      [placeholder]="placeholder"
      [openable]="openable"
    ></app-search>`,
  }),
};
