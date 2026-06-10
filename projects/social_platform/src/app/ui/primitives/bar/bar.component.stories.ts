/** @format */

import { Meta, StoryObj, applicationConfig } from "@storybook/angular";
import { provideRouter } from "@angular/router";
import { BarComponent } from "./bar.component";

const meta: Meta<BarComponent> = {
  title: "UI/PRIMITIVES/Bar",
  component: BarComponent,
  tags: ["autodocs"],
  // Внутри RouterLink/RouterLinkActive — нужен провайдер роутера.
  decorators: [applicationConfig({ providers: [provideRouter([])] })],
  render: args => ({
    props: args,
    template: `<app-bar [links]="links" [ballHave]="ballHave"></app-bar>`,
  }),
};
export default meta;

type Story = StoryObj<BarComponent>;

export const Default: Story = {
  args: {
    ballHave: false,
    links: [
      { link: "/feed", linkText: "Лента", isRouterLinkActiveOptions: false },
      { link: "/projects", linkText: "Проекты", isRouterLinkActiveOptions: false, count: 3 },
    ],
  },
};
