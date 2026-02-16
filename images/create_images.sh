#!/bin/bash
# Create placeholder images using ImageMagick if available
# Otherwise create minimal PNG files

create_placeholder() {
    local width=$1
    local height=$2
    local output=$3
    
    # Try with ImageMagick first
    if command -v convert &> /dev/null; then
        convert -size ${width}x${height} xc:blue \
                -pointsize 60 -fill white -gravity center \
                -annotate +0+0 "Roku\nBrowser" \
                "$output"
    else
        # Create a minimal valid PNG file
        # This is a 1x1 transparent PNG
        echo -ne '\x89\x50\x4e\x47\x0d\x0a\x1a\x0a\x00\x00\x00\x0d\x49\x48\x44\x52\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15\xc4\x89\x00\x00\x00\x0a\x49\x44\x41\x54\x78\x9c\x63\x00\x01\x00\x00\x05\x00\x01\x0d\x0a\x2d\xb4\x00\x00\x00\x00\x49\x45\x4e\x44\xae\x42\x60\x82' > "$output"
    fi
}

create_placeholder 540 405 icon_focus_hd.png
create_placeholder 214 144 icon_focus_sd.png
create_placeholder 1920 1080 splash_hd.png
create_placeholder 720 480 splash_sd.png

echo "Images created"
