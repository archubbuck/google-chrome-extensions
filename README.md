# Google Chrome Extensions Monorepo

This repository is an Nx-powered monorepo optimized for the development and scaling of multiple Manifest V3 Google Chrome extensions. By utilizing a shared React and TypeScript architecture, it provides a high-performance environment for building modular browser tools that share core logic, UI components, and utility libraries.

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

## Projects

### Screener Saver

A Chrome extension for UserTesting.com that automatically saves screener questions and answers for easy reference and search.

**Features:**
- Automatically detects and captures screener questions (targeting `tk-card-select` and `split-view` patterns)
- Saves question text and user-selected answers upon submission
- Uses `chrome.storage.local` for data persistence
- React-based popup UI for browsing and searching saved questions
- Real-time search filtering
- Individual question deletion and bulk clear functionality

## Getting Started

### Prerequisites

- Node.js (LTS version recommended)
- npm

### Installation

```sh
npm install
```

### Build the Extensions

To build all extensions for production:

```sh
npx nx build screener-saver
```

The built extension will be in `apps/screener-saver/dist/`.

### Load the Extension in Chrome

1. Build the extension: `npx nx build screener-saver`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `apps/screener-saver/dist/` directory
6. The extension is now installed and ready to use!

### Development

To run the development server:

```sh
npx nx serve screener-saver
```

**Note:** The popup relies on Chrome extension APIs such as `chrome.storage.local`. When running via `npx nx serve screener-saver` as a normal web app, the extension will fall back to using `localStorage` for development. For full Chrome extension functionality, you'll typically want to build and reload the extension in Chrome (see "Load the Extension in Chrome" above).

## Project Structure

```
apps/
  screener-saver/
    src/
      app/              # React popup UI
      content-script.ts # Content script for detecting and capturing questions
      main.tsx          # Entry point for popup
    public/
      manifest.json     # Chrome extension manifest (Manifest V3)
      favicon.ico       # Extension icon
```

## Technologies

- **Nx**: Monorepo management and build orchestration
- **React**: UI framework for extension popups
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Chrome Extensions API**: Manifest V3
- **@gb-nx/browser**: Nx plugin for browser extension development

## Run tasks

To see all available targets to run for a project, run:

```sh
npx nx show project screener-saver
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs »](https://nx.dev/features/run-tasks)

## Add new projects

To generate a new Chrome extension based on the screener-saver template:

```sh
npx nx g @nx/react:app my-extension
```

Then configure it as a Chrome extension by:
1. Adding a `manifest.json` to `public/`
2. Creating content scripts in `src/`
3. Updating `vite.config.mts` to build the extension properly

## CI/CD

This repository includes automated CI/CD workflows for building, testing, and publishing extensions to the Chrome Web Store.

- **Continuous Integration:** Automatically builds and tests extensions on every push and pull request
- **Automated Publishing:** Publishes extensions to Chrome Web Store when version tags are pushed

See [.github/CICD_SETUP.md](.github/CICD_SETUP.md) for detailed setup instructions.

## Useful links

Learn more:

- [Learn more about this workspace setup](https://nx.dev/getting-started/tutorials/react-monorepo-tutorial)
- [Learn about Nx on CI](https://nx.dev/ci/intro/ci-with-nx)
- [Chrome Extensions Manifest V3 Documentation](https://developer.chrome.com/docs/extensions/mv3/)
- [What are Nx plugins?](https://nx.dev/concepts/nx-plugins)

And join the Nx community:
- [Discord](https://go.nx.dev/community)
- [Follow us on X](https://twitter.com/nxdevtools) or [LinkedIn](https://www.linkedin.com/company/nrwl)
- [Our Youtube channel](https://www.youtube.com/@nxdevtools)
- [Our blog](https://nx.dev/blog)
