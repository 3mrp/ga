#!/bin/bash

# Script to create a sideloadable Roku app ZIP file

echo "Creating Roku Browser ZIP file..."

# Remove old ZIP if it exists
if [ -f RokuBrowser.zip ]; then
    echo "Removing old RokuBrowser.zip..."
    rm RokuBrowser.zip
fi

# Create the ZIP file with required structure
# Note: Files must be at root level in the ZIP
zip -r RokuBrowser.zip manifest source components images

if [ $? -eq 0 ]; then
    echo "✓ Successfully created RokuBrowser.zip"
    echo ""
    echo "Next steps:"
    echo "1. Enable developer mode on your Roku device"
    echo "2. Navigate to http://YOUR_ROKU_IP in a web browser"
    echo "3. Login with username 'rokudev' and your developer password"
    echo "4. Upload RokuBrowser.zip and click Install"
    echo ""
    echo "See README.md for detailed instructions."
else
    echo "✗ Failed to create ZIP file"
    exit 1
fi
