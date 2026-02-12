# Screener Saver - Chrome Extension

A Manifest V3 Chrome extension for UserTesting.com that automatically saves screener questions and answers for easy reference and search.

## Features

### Content Script
- **Automatic Detection**: Monitors UserTesting.com pages for screener questions
- **Pattern Matching**: Targets `tk-card-select` and `split-view` UI patterns
- **Smart Capture**: Extracts question text and selected answers upon submission
- **Duplicate Prevention**: Avoids saving identical question-answer pairs

### Popup Interface
- **Browse Questions**: View all saved questions in a clean, organized interface
- **Real-time Search**: Filter questions by text or answer
- **Question Management**: 
  - Delete individual questions
  - Clear all questions at once
- **Rich Metadata**: See timestamps and source URLs for each question

### Storage
- Uses `chrome.storage.local` for persistent data storage
- No external server required - all data stays local

## Installation

### From Source

1. **Build the extension:**
   ```bash
   npm install
   npx nx build screener-saver
   ```

2. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `apps/screener-saver/dist/` directory

3. **Start using:**
   - Visit UserTesting.com
   - Complete a screener
   - Click the extension icon to view saved questions

## How It Works

### Content Script Detection
The content script (`content-script.ts`) uses multiple strategies to detect screener questions:

1. **Class-based detection**: Searches for elements with classes containing:
   - `tk-card-select`
   - `split-view`
   - `question-container`
   - `screener`

2. **Data attribute detection**: Looks for `data-test` attributes related to questions

3. **Question text extraction**: Tries multiple selectors:
   - `.question-text`
   - `[data-test="question-text"]`
   - Heading tags (`h2`, `h3`, etc.)
   - Specific classes like `.tk-card-select__title`

4. **Answer extraction**: Detects selected answers from:
   - Radio buttons (`input[type="radio"]:checked`)
   - Checkboxes (`input[type="checkbox"]:checked`)
   - Elements with `.selected` class
   - Elements with `aria-selected="true"`

### Submission Detection
The extension monitors for submit button clicks:
- Looks for buttons with type="submit"
- Searches for buttons with classes containing "submit", "continue", or "next"
- Checks for data attributes related to submission

When a submit button is clicked, the extension:
1. Waits 100ms for the UI to settle
2. Captures all visible screener questions and answers
3. Saves them to chrome.storage.local
4. Prevents duplicates

### Dynamic Content Handling
Uses a MutationObserver to detect when new questions appear on the page, ensuring the extension works with:
- Single-page applications
- Dynamically loaded content
- Multi-step screeners

## Architecture

### Technology Stack
- **Build System**: Nx monorepo with Vite
- **UI Framework**: React with TypeScript
- **Styling**: CSS Modules
- **Extension API**: Chrome Manifest V3

### Project Structure
```
apps/screener-saver/
├── src/
│   ├── app/
│   │   ├── app.tsx          # Main popup React component
│   │   └── app.module.css   # Popup styles
│   ├── content-script.ts    # Content script for question detection
│   └── main.tsx             # React entry point
├── public/
│   ├── manifest.json        # Extension manifest
│   └── favicon.ico          # Extension icon
└── vite.config.mts          # Build configuration
```

### Build Process
The Vite configuration (`vite.config.mts`) handles:
1. Building the React popup as `index.html`
2. Bundling the content script separately as `content-script.js`
3. Copying `manifest.json` and icons to the dist folder
4. Proper output structure for Chrome extension loading

## Development

### Prerequisites
- Node.js (LTS version)
- npm
- Chrome browser

### Setup
```bash
npm install
```

### Build Commands
```bash
# Production build
npx nx build screener-saver

# Type checking
npx nx typecheck screener-saver

# Linting
npx nx lint screener-saver

# Development server (for popup UI testing)
npx nx serve screener-saver
```

### Testing Changes
1. Make your changes
2. Run `npx nx build screener-saver`
3. Go to `chrome://extensions/`
4. Click the reload icon on the Screener Saver extension
5. Test on UserTesting.com

## Data Format

Questions are stored in the following format:
```typescript
interface ScreenerQuestion {
  id: string;           // Unique identifier
  questionText: string; // The question text
  answer: string;       // Selected answer(s)
  timestamp: number;    // When it was saved (Unix timestamp)
  url: string;          // Source page URL
}
```

All questions are stored in `chrome.storage.local` under the key `savedQuestions`.

## Privacy

- **No data collection**: All data stays on your local machine
- **No network requests**: The extension doesn't send data anywhere
- **No tracking**: No analytics or monitoring
- **Open source**: All code is visible and auditable

## Troubleshooting

### Extension not detecting questions
- Ensure you're on a UserTesting.com screener page
- Check if the page uses different class names or structure
- Open DevTools Console and look for "[Screener Saver]" log messages

### Questions not saving
- Check if you clicked a submit/continue button
- Verify the extension has the necessary permissions
- Check Chrome DevTools Console for error messages

### Popup not showing saved questions
- Check if the extension icon shows any errors
- Verify data is in storage: DevTools > Application > Storage > Local Storage

## Future Enhancements

Potential features for future versions:
- Export questions to CSV/JSON
- Import/sync questions across devices
- Categories and tags for questions
- Better icon and branding
- Support for other survey/testing platforms
- Question analytics and insights

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues, questions, or suggestions, please open an issue on the GitHub repository.
