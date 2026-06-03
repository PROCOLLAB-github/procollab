import type { Preview } from "@storybook/angular";
import { applicationConfig } from "@storybook/angular";
import { provideZonelessChangeDetection } from "@angular/core";

const preview: Preview = {
  // Приложение zoneless — без этого signals в историях не обновляются.
  decorators: [
    applicationConfig({
      providers: [provideZonelessChangeDetection()],
    }),
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
