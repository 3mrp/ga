# Quick Start Guide

## What You Get

This repository now contains a complete Roku browser application that you can sideload onto your Roku device!

## What's Included

1. **Complete Roku App Structure**
   - `manifest` - App configuration
   - `source/main.brs` - Application entry point
   - `components/BrowserScene.xml` - UI layout
   - `components/BrowserScene.brs` - Browser functionality
   - `images/` - App icons and splash screens

2. **Build Scripts**
   - `build.sh` - For Linux/Mac users
   - `build.bat` - For Windows users

3. **Ready-to-Sideload ZIP**
   - `RokuBrowser.zip` - Already created and ready to install!

## Installation (Quick Version)

### Step 1: Enable Developer Mode on Roku

Press this sequence on your Roku remote:
- Home (3x) → Up (2x) → Right → Left → Right → Left → Right

Set a developer password and note your Roku's IP address.

### Step 2: Sideload the App

1. On your computer, open a web browser
2. Go to: `http://YOUR_ROKU_IP` (replace with your Roku's IP)
3. Login: username `rokudev`, password is what you set
4. Upload `RokuBrowser.zip` and click Install
5. The app will appear on your Roku home screen!

## Using the Browser

- **OK button**: Enter URL or search term
- **Arrow keys**: Navigate and scroll
- **Left/Right**: Browser back/forward
- **Replay**: Refresh page

## Example URLs to Try

- `example.com`
- `wikipedia.org`
- Search for anything: `weather today`

## Important Notes

- This browser displays text content from websites
- Full HTML rendering with images/CSS is not available on Roku
- Some websites may not work due to Roku platform limitations
- The app uses HTTPS by default for security

## Need Help?

See the full `README.md` for detailed instructions and troubleshooting.

## Rebuilding the ZIP

If you make changes to the app:

**Linux/Mac:**
```bash
./build.sh
```

**Windows:**
```
build.bat
```

## Project Structure

```
├── manifest                 # Roku app configuration
├── source/
│   └── main.brs            # App entry point
├── components/
│   ├── BrowserScene.xml    # UI layout
│   └── BrowserScene.brs    # Browser logic
├── images/                  # App icons
├── build.sh / build.bat    # Build scripts
└── RokuBrowser.zip         # Ready to sideload!
```

Enjoy your Roku browser! 🎉
