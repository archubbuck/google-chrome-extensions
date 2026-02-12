import { render } from '@testing-library/react';
import { vi } from 'vitest';

import App from './app';

// Mock chrome.storage API
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).chrome = {
  storage: {
    local: {
      get: vi.fn(() => Promise.resolve({ savedQuestions: [] })),
      set: vi.fn(() => Promise.resolve()),
    },
  },
};

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<App />);
    expect(baseElement).toBeTruthy();
  });

  it('should have the title "Screener Saver"', async () => {
    const { findByText } = render(<App />);
    const title = await findByText('Screener Saver');
    expect(title).toBeTruthy();
  });

  it('should show empty state when no questions are saved', async () => {
    const { findByText } = render(<App />);
    const emptyMessage = await findByText('No saved questions yet.');
    expect(emptyMessage).toBeTruthy();
  });
});
