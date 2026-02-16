@echo off
REM Script to create a sideloadable Roku app ZIP file for Windows

echo Creating Roku Browser ZIP file...

REM Remove old ZIP if it exists
if exist RokuBrowser.zip (
    echo Removing old RokuBrowser.zip...
    del RokuBrowser.zip
)

REM Create the ZIP file using PowerShell
powershell -Command "Compress-Archive -Path manifest,source,components,images -DestinationPath RokuBrowser.zip -Force"

if %ERRORLEVEL% EQU 0 (
    echo Successfully created RokuBrowser.zip
    echo.
    echo Next steps:
    echo 1. Enable developer mode on your Roku device
    echo 2. Navigate to http://YOUR_ROKU_IP in a web browser
    echo 3. Login with username 'rokudev' and your developer password
    echo 4. Upload RokuBrowser.zip and click Install
    echo.
    echo See README.md for detailed instructions.
) else (
    echo Failed to create ZIP file
    exit /b 1
)

pause
