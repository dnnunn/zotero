# Zotero Local Development Setup Guide

## Overview
This guide covers setting up a local development environment for Zotero with custom reader integration, allowing you to test modifications to both the main Zotero application and the reader component.

## Prerequisites
- macOS (this guide covers macOS-specific steps)
- Node.js and npm installed
- Git
- Terminal access

## Project Structure Setup

### 1. Initial Directory Structure
```
zotero-projects/
├── reader/          # Your original reader project
└── zotero/         # Your forked Zotero project
```

### 2. Clone Your Projects
```bash
cd ~/Desktop/Github/
mkdir zotero-projects
cd zotero-projects

# Clone your reader repository
git clone https://github.com/YOUR_USERNAME/reader.git

# Clone your forked Zotero repository  
git clone https://github.com/YOUR_USERNAME/zotero.git
```

## Building the Reader

### 1. Build Your Reader
```bash
cd reader/
npm ci
npm run build

# Verify build output
ls -la build/zotero/
# Should contain: reader.js, reader.css, reader.html, etc.
```

### 2. Understanding Reader Build Output
The reader build creates files in `reader/build/zotero/` that need to be integrated into the main Zotero application.

## Integrating Reader into Zotero

### 1. Copy Reader Files to Resource Directory
**Critical:** The reader files must be placed in `resource/reader/`, not `build/resource/reader/`

```bash
cd ../zotero/

# Create reader directory in main resource folder
mkdir -p resource/reader

# Copy built reader files
cp -R ../reader/build/zotero/* resource/reader/

# Verify files are in correct location
ls -la resource/reader/
```

### 2. Why This Location Matters
- Zotero's build system symlinks `resource/**/*` into the final package
- Files in `build/resource/reader/` are not included in the symlink process
- The `resource/reader/` location ensures files are packaged in `omni.ja`

## Building Zotero

### 1. Install Dependencies
```bash
npm ci
```

### 2. Build JavaScript Components
```bash
# Build JS/CSS components
npm run build

# If build hangs, try components individually:
node js-build/js.js
node js-build/sass.js
node js-build/copy.js
```

### 3. Create Application Bundle
```bash
# Build the app directory structure
./app/scripts/dir_build
```

### 4. Verify Reader Integration
```bash
# Check if reader files are in omni.ja
cd app/staging/Zotero.app/Contents/Resources/app/
unzip -l omni.ja | grep "resource/reader"

# Should see entries like:
# resource/reader/reader.js
# resource/reader/reader.css
# resource/reader/reader.html
```

## Running Zotero

### 1. Launch Zotero with Debug Options
```bash
cd /path/to/your/zotero-projects/zotero
./app/staging/Zotero.app/Contents/MacOS/zotero -ZoteroDebugText -purgecaches -jsconsole
```

### 2. Alternative Launch Methods
```bash
# Simple launch
./app/staging/Zotero.app/Contents/MacOS/zotero

# Launch via macOS
open app/staging/Zotero.app
```

## Development Workflow

### 1. Making Reader Changes
```bash
# 1. Modify reader code
cd reader/
# ... make changes ...

# 2. Rebuild reader
npm run build

# 3. Copy to Zotero
cd ../zotero/
cp -R ../reader/build/zotero/* resource/reader/

# 4. Rebuild Zotero app
./app/scripts/dir_build

# 5. Test changes
./app/staging/Zotero.app/Contents/MacOS/zotero -ZoteroDebugText -purgecaches
```

### 2. Making Zotero Changes
```bash
# 1. Modify Zotero code
# ... make changes ...

# 2. Rebuild affected components
npm run build
# or specific components:
# node js-build/js.js

# 3. Rebuild app
./app/scripts/dir_build

# 4. Test changes
./app/staging/Zotero.app/Contents/MacOS/zotero -ZoteroDebugText -purgecaches
```

## Troubleshooting

### Build Issues

**Reader Download Failures:**
If you see `curl: (22) The requested URL returned error: 403`, the build system is trying to download a pre-built reader. The fallback mechanism should automatically use your local reader code.

**JavaScript Build Hanging:**
```bash
# Try building components individually
node js-build/js.js
node js-build/sass.js
node js-build/copy.js

# Or with more memory
NODE_OPTIONS="--max-old-space-size=4096" npm run build
```

**Reader Files Missing from omni.ja:**
- Ensure files are in `resource/reader/`, not `build/resource/reader/`
- Rebuild with `./app/scripts/dir_build`
- Verify with `unzip -l omni.ja | grep "resource/reader"`

### Runtime Issues

**File Not Found Errors:**
```
The file jar:file:///.../omni.ja!/resource/reader/reader.html cannot be found
```
This means reader files weren't included in the build. Follow the "Reader Files Missing" troubleshooting above.

**Reader Function Errors:**
```
TypeError: this._iframeWindow.wrappedJSObject.createReader is not a function
```
This indicates the reader JavaScript isn't loading properly. Check that `resource/reader/reader.js` exists and is properly built.

## Key Concepts

### Build System Architecture
- **Resource Symlinking:** Files in `resource/` are symlinked into the final package
- **omni.ja Packaging:** All application resources are packaged into a single `omni.ja` file
- **Reader Integration:** Reader files must be in `resource/reader/` to be included

### File Locations
- **Source:** `reader/build/zotero/*` (reader build output)
- **Target:** `zotero/resource/reader/*` (Zotero resource directory)
- **Final:** `omni.ja!/resource/reader/*` (packaged application)

### Development vs Production
- **Development:** Uses local files from `resource/reader/`
- **Production:** Downloads pre-built reader from AWS S3
- **Fallback:** If download fails, builds reader locally

## Testing Your Setup

### 1. Verify Reader Integration
1. Launch Zotero
2. Import or open a PDF document
3. Verify the reader opens and functions correctly
4. Test any custom reader features you've implemented

### 2. Test Both Components
1. **Zotero Core:** Test library management, sync, preferences
2. **Reader:** Test PDF viewing, annotations, search functionality
3. **Integration:** Test reader opening from library, annotation sync

## Useful Commands Reference

```bash
# Quick rebuild workflow
cd zotero/
cp -R ../reader/build/zotero/* resource/reader/
./app/scripts/dir_build
./app/staging/Zotero.app/Contents/MacOS/zotero -ZoteroDebugText -purgecaches

# Check build components
ls -la resource/reader/
ls -la app/staging/Zotero.app/Contents/MacOS/
unzip -l app/staging/Zotero.app/Contents/Resources/app/omni.ja | grep reader

# Clean rebuild
npm run clean
npm run build
./app/scripts/dir_build
```

## Notes
- Always use the `-purgecaches` flag during development to ensure changes are loaded
- The `-ZoteroDebugText` flag provides useful debug output
- The `-jsconsole` flag opens the JavaScript console for debugging
- Files in `resource/` are symlinked, so changes require rebuilding the app bundle

This setup allows you to develop and test both Zotero core functionality and custom reader features in a complete local environment.