import { css } from '@emotion/css';
import type { Decorator, Preview } from "@storybook/react";
import React from "react";

import './storybook.css';
import '/public/root.css';

const sectionStyle = css(
  {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  }
);

const withThemeProvider: Decorator = (Story, context) => {
  const theme = context.globals.theme;
  document?.documentElement?.setAttribute('color-theme', context.globals.theme);
  return Story({ ...context, globals: { ...context.globals, theme } });
};

const withSectionWrapper: Decorator = (Story, context) => <section className={sectionStyle}><Story /></section>;

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Global color scheme for components.',
      defaultValue: 'light',
      toolbar: {
        title: 'Color Scheme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light Mode' },
          { value: 'dark', title: 'Dark Mode' },
          { value: 'deep-dark', title: 'Deep Dark Mode' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withThemeProvider, withSectionWrapper],
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;

