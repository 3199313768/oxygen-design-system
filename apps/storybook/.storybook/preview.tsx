import type { Preview } from '@storybook/react-vite';

import '@oxygen-design/ui/styles.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    a11y: {
      test: 'error',
    },
    controls: {
      expanded: true,
    },
    layout: 'padded',
    viewport: {
      options: {
        desktop: {
          name: 'Desktop',
          styles: { height: '900px', width: '1440px' },
        },
        iphone: {
          name: 'iPhone',
          styles: { height: '844px', width: '390px' },
        },
      },
    },
  },
  tags: ['autodocs'],
};

export default preview;
