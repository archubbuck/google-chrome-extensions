# CI/CD Setup Guide

This repository includes automated CI/CD workflows for building, testing, and publishing Google Chrome extensions to the Chrome Web Store.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**Actions:**
- Installs dependencies
- Runs linting
- Runs type checking
- Runs tests
- Builds the extension
- Uploads build artifacts

### 2. Publish Workflow (`publish.yml`)

**Triggers:**
- Push of version tags (e.g., `v1.0.0`)
- Manual trigger via GitHub Actions UI

**Actions:**
- Builds the extension
- Packages it as a ZIP file
- Uploads to Chrome Web Store
- Creates a GitHub release with the extension package

## Setting Up Chrome Web Store Publishing

To enable automated publishing to the Chrome Web Store, you need to set up API credentials and configure GitHub secrets.

### Step 1: Get Chrome Web Store API Credentials

1. **Create a Google Cloud Project:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Chrome Web Store API

2. **Create OAuth 2.0 Credentials:**
   - In the Google Cloud Console, go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Desktop app" or "Web application" as the application type
   - Note down the **Client ID** and **Client Secret**

3. **Get Refresh Token:**
   
   You'll need to generate a refresh token. Here's how to do it:

   a. Open a browser and navigate to this URL (replace `YOUR_CLIENT_ID` with your actual Client ID):
   
   ```
   https://accounts.google.com/o/oauth2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&client_id=YOUR_CLIENT_ID&redirect_uri=http://localhost
   ```

   b. Authorize the application. You'll be redirected to localhost (which will fail to load), but copy the authorization code from the URL bar. The URL will look like: `http://localhost/?code=AUTHORIZATION_CODE`

   c. Exchange the authorization code for a refresh token using curl:
   
   ```bash
   curl -X POST \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "code=AUTHORIZATION_CODE" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=http://localhost" \
     https://oauth2.googleapis.com/token
   ```

   d. Save the `refresh_token` from the response

4. **Get Extension ID:**
   - Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
   - Upload your extension manually for the first time (or note the ID of an existing extension)
   - The Extension ID is visible in the dashboard URL or extension details

### Step 2: Configure GitHub Secrets

Add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings > Secrets and variables > Actions
3. Click "New repository secret" and add each of the following:

| Secret Name | Description |
|-------------|-------------|
| `CHROME_EXTENSION_ID` | The ID of your Chrome extension from the Web Store |
| `CHROME_CLIENT_ID` | OAuth 2.0 Client ID from Google Cloud Console |
| `CHROME_CLIENT_SECRET` | OAuth 2.0 Client Secret from Google Cloud Console |
| `CHROME_REFRESH_TOKEN` | The refresh token obtained in Step 1 |

### Step 3: Publishing a New Version

To publish a new version of the extension:

1. **Update the version in manifest.json:**
   ```bash
   # Edit apps/screener-saver/public/manifest.json
   # Update the "version" field (e.g., from "1.0.0" to "1.0.1")
   ```

2. **Commit and push your changes:**
   ```bash
   git add apps/screener-saver/public/manifest.json
   git commit -m "Bump version to 1.0.1"
   git push origin main
   ```

3. **Create and push a version tag:**
   ```bash
   git tag v1.0.1
   git push origin v1.0.1
   ```

4. **Monitor the workflow:**
   - Go to the Actions tab in your GitHub repository
   - Watch the "Publish to Chrome Web Store" workflow run
   - Once complete, your extension will be published to the Chrome Web Store

### Manual Publishing

You can also manually trigger the publish workflow:

1. Go to the Actions tab in your GitHub repository
2. Click on "Publish to Chrome Web Store" workflow
3. Click "Run workflow"
4. Select the branch and click "Run workflow"

## Troubleshooting

### Common Issues

1. **Authentication Errors:**
   - Verify that all secrets are correctly set in GitHub
   - Ensure the refresh token hasn't expired (they typically don't expire unless revoked)
   - Check that the Chrome Web Store API is enabled in your Google Cloud Project

2. **Build Failures:**
   - Check the CI workflow logs for specific errors
   - Ensure all dependencies are correctly listed in `package.json`
   - Verify that the build works locally: `npx nx build screener-saver`

3. **Upload Failures:**
   - Verify the extension ID matches your Chrome Web Store extension
   - Check that the manifest.json version is higher than the currently published version
   - Ensure the ZIP file is correctly structured (manifest.json should be at the root)

### Debugging Tips

- Run the build locally to ensure it produces a valid extension
- Load the built extension in Chrome manually to test before publishing
- Check the Chrome Web Store Developer Dashboard for any issues with your extension

## Additional Resources

- [Chrome Web Store Developer Documentation](https://developer.chrome.com/docs/webstore/)
- [Chrome Web Store API Reference](https://developer.chrome.com/docs/webstore/api_index/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
