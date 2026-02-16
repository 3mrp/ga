# Roku Web Browser App

A web browser application for Roku devices that can be sideloaded for personal use.

## Features

- Enter URLs or search terms directly
- Navigate web pages with text content display
- Browse history with back/forward navigation
- Refresh current page
- Scroll through content with arrow keys
- Search integration with DuckDuckGo

## Important Note

Due to Roku platform limitations, this browser can fetch and display text content from websites. Full HTML rendering with CSS, JavaScript, and images is not available on Roku devices. The app extracts and displays text content from web pages.

## Installation Instructions

### Prerequisites

1. A Roku device (Roku TV, Streaming Stick, etc.)
2. The Roku device and your computer must be on the same network
3. Developer mode must be enabled on your Roku device

### Enabling Developer Mode on Roku

1. On your Roku remote, press the following sequence:
   - Home button (3 times)
   - Up button (2 times)
   - Right button (1 time)
   - Left button (1 time)
   - Right button (1 time)
   - Left button (1 time)
   - Right button (1 time)

2. You'll see a "Developer Settings" screen
3. Enable "Installer" and note your Roku's IP address
4. Set a developer password (you'll need this later)
5. Restart your Roku if prompted

### Creating the Sideloadable ZIP File

1. Navigate to the repository directory
2. Create a ZIP file containing these required files and folders:
   ```bash
   zip -r RokuBrowser.zip manifest source components images
   ```

   Or on Windows using PowerShell:
   ```powershell
   Compress-Archive -Path manifest,source,components,images -DestinationPath RokuBrowser.zip
   ```

3. The ZIP file should contain:
   - `manifest` (at root level)
   - `source/` directory with `main.brs`
   - `components/` directory with `BrowserScene.xml` and `BrowserScene.brs`
   - `images/` directory with icon and splash screen images

### Sideloading the App

#### Method 1: Using Web Browser

1. Open a web browser on your computer
2. Navigate to: `http://YOUR_ROKU_IP` (replace with your Roku's IP address)
3. Log in with username: `rokudev` and the password you set earlier
4. Click on "Browse" and select the `RokuBrowser.zip` file
5. Click "Install" and wait for the upload to complete
6. The app will appear on your Roku home screen

#### Method 2: Using curl Command Line

```bash
curl -u rokudev:YOUR_PASSWORD -F "mysubmit=Install" -F "archive=@RokuBrowser.zip" http://YOUR_ROKU_IP/plugin_install
```

Replace `YOUR_PASSWORD` with your developer password and `YOUR_ROKU_IP` with your Roku's IP address.

## Using the Browser

### Controls

- **OK/SELECT button**: Open the keyboard to enter a URL or search term
- **UP arrow**: Scroll up through content
- **DOWN arrow**: Scroll down through content
- **LEFT arrow**: Go back in browsing history
- **RIGHT arrow**: Go forward in browsing history
- **REPLAY button**: Refresh the current page
- **HOME button**: Return to Roku home screen

### Entering URLs

When you press OK, a keyboard will appear. You can:

1. Enter a full URL: `https://example.com`
2. Enter a domain: `example.com` (https:// will be added automatically)
3. Enter a search term: `roku browser` (will search using DuckDuckGo)

### Tips

- The browser works best with text-based websites
- Some websites may block requests from the Roku browser
- Complex websites with heavy JavaScript will only show text content
- Images and styling are not displayed

## Troubleshooting

### App Won't Install

- Make sure all required files are in the ZIP at the root level
- Check that the manifest file has Unix-style line endings (LF, not CRLF)
- Verify your Roku is in developer mode
- Try restarting your Roku device

### Can't Access Developer Screen

- Make sure your computer and Roku are on the same network
- Try accessing `http://YOUR_ROKU_IP` in a private/incognito browser window
- Verify the IP address is correct by checking Network settings on your Roku

### Pages Won't Load

- Check that your Roku has internet connectivity
- Some websites may block or restrict access from Roku devices
- Try simpler, text-based websites first
- HTTPS is used by default for security

## Project Structure

```
├── manifest                      # App configuration and metadata
├── source/
│   └── main.brs                 # Main application entry point
├── components/
│   ├── BrowserScene.xml         # UI layout and scene definition
│   └── BrowserScene.brs         # Browser logic and functionality
├── images/
│   ├── icon_focus_hd.png       # App icon (HD)
│   ├── icon_focus_sd.png       # App icon (SD)
│   ├── splash_hd.png           # Splash screen (HD)
│   └── splash_sd.png           # Splash screen (SD)
└── README.md                    # This file
```

## Technical Details

- Built with BrightScript and SceneGraph
- Uses roUrlTransfer for HTTP requests
- Text extraction from HTML content
- Simple navigation and history management
- Keyboard input for URL entry

## Limitations

- No JavaScript execution
- No CSS rendering
- No image display
- Text content only
- Limited HTML parsing
- Some websites may not work properly

## Development

To modify the app:

1. Edit the files in the repository
2. Create a new ZIP file with your changes
3. Sideload the updated ZIP to your Roku
4. The app will be updated on your device

## License

This is a personal project for sideloading on Roku devices. Please respect website terms of service when browsing.

## Disclaimer

This is an unofficial app not endorsed by Roku. Use at your own risk. The app is for personal use only. Some websites may not function properly or may block access.
